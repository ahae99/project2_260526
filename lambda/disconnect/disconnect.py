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
        ctx = event["requestContext"]
        connection_id = ctx["connectionId"]
        domain_name = ctx["domainName"]
        stage = ctx["stage"]

        response = table.get_item(Key={"connectionId": connection_id})
        callsign = response.get("Item", {}).get("callsign", "unknown")

        try:
            table.delete_item(Key={"connectionId": connection_id})
        except Exception as e:
            logger.error("Failed to delete connection %s: %s", connection_id, e)
            return {"statusCode": 500, "body": "Internal server error"}

        now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        _broadcast_system(domain_name, stage, "user_left", callsign, now)

        return {"statusCode": 200, "body": "Disconnected"}

    except Exception as e:
        logger.error("Unexpected error in disconnect: %s", e, exc_info=True)
        return {"statusCode": 500, "body": "Internal server error"}


def _broadcast_system(domain_name, stage, event_type, callsign, timestamp):
    payload = json.dumps({
        "type": "system",
        "event": event_type,
        "callsign": callsign,
        "timestamp": timestamp,
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
            logger.error("Failed to broadcast to %s: %s", cid, e)


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
