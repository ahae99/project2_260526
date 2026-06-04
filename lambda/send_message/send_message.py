import json
import logging
import os
from datetime import datetime, timezone

import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)

TABLE_NAME = os.environ["TABLE_NAME"]

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(TABLE_NAME)


def handler(event, context):
    try:
        try:
            body = json.loads(event.get("body") or "{}")
        except json.JSONDecodeError:
            return {"statusCode": 400, "body": "Invalid JSON body"}

        text = body.get("text", "")
        if not text or not isinstance(text, str) or len(text) > 1000:
            return {"statusCode": 400, "body": "Missing or invalid text"}

        ctx = event["requestContext"]
        connection_id = ctx["connectionId"]
        domain_name = ctx["domainName"]
        stage = ctx["stage"]

        response = table.get_item(Key={"connectionId": connection_id})
        sender = response.get("Item")
        if not sender:
            return {"statusCode": 400, "body": "Unknown sender"}
        callsign = sender["callsign"]

        now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        payload = json.dumps({
            "type": "message",
            "callsign": callsign,
            "text": text,
            "timestamp": now,
        }).encode("utf-8")

        connections = _scan_all()

        endpoint_url = f"https://{domain_name}/{stage}"
        apigw = boto3.client("apigatewaymanagementapi", endpoint_url=endpoint_url)

        for conn in connections:
            cid = conn["connectionId"]
            try:
                apigw.post_to_connection(ConnectionId=cid, Data=payload)
            except apigw.exceptions.GoneException:
                table.delete_item(Key={"connectionId": cid})
            except Exception as e:
                logger.error("Failed to send to %s: %s", cid, e)

        return {"statusCode": 200, "body": "Message sent"}

    except Exception as e:
        logger.error("Unexpected error in send_message: %s", e, exc_info=True)
        return {"statusCode": 500, "body": "Internal server error"}


def _scan_all():
    connections = []
    scan_kwargs = {"ProjectionExpression": "connectionId"}
    while True:
        response = table.scan(**scan_kwargs)
        connections.extend(response["Items"])
        if "LastEvaluatedKey" not in response:
            break
        scan_kwargs["ExclusiveStartKey"] = response["LastEvaluatedKey"]
    return connections
