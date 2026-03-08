import boto3

client = boto3.client("cognito-idp")

USER_POOL_CLIENT_ID = "6n6pjlkr73p7tte6ho5jq6qd2j"


def login(email, password):

    response = client.initiate_auth(
        ClientId=USER_POOL_CLIENT_ID,
        AuthFlow="USER_PASSWORD_AUTH",
        AuthParameters={
            "USERNAME": email,
            "PASSWORD": password
        }
    )

    return response["AuthenticationResult"]