import json
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

# =========================================================================
# !!! STEP 6: CONFIGURE THESE THREE VALUES !!!
# =========================================================================
SLACK_BOT_TOKEN = "xoxb-4085360006272-9810795941623-c3wtkuxU6EzXAolpa5AF6UqA" # Paste your xoxb- token here
CHANNEL_ID = "C07GJFVLYKS"                     # Paste your private group ID here
OUTPUT_MESSAGES_FILE = f"{CHANNEL_ID}_messages.json"
OUTPUT_USERS_FILE = "all_users.json"
# =========================================================================

# --- API CLIENT INIT ---
try:
    client = WebClient(token=SLACK_BOT_TOKEN)
except Exception as e:
    print(f"Error initializing Slack client: {e}")
    exit()

# --- FUNCTION 1: FETCH ALL USERS (Handles 200+ people via pagination) ---
def fetch_all_users():
    """Fetches all users from the workspace, ensuring pagination for large teams."""
    print("--- 1/2: Fetching All Users (user IDs to names) ---")
    users = []
    cursor = None
    
    while True:
        try:
            # The users.list method is used to get all members
            response = client.users_list(
                cursor=cursor,
                limit=1000 # Request a large limit to minimize requests
            )
            
            if not response["ok"]:
                raise SlackApiError("User list API call failed", response)

            users.extend(response["members"])
            
            cursor = response.get("response_metadata", {}).get("next_cursor")
            
            if not cursor:
                break # Stop if no more pages

            print(f"Fetched {len(users)} users so far. Getting next page...")
            
        except SlackApiError as e:
            print(f"\nFATAL ERROR retrieving users: {e.response['error']}")
            print("Action needed: Did you add the `users:read` scope?")
            return None
        except Exception as e:
            print(f"\nAn unexpected error occurred: {e}")
            return None
            
    return users

# --- FUNCTION 2: FETCH CHANNEL MESSAGES (Handles pagination for history) ---
def fetch_channel_history(channel_id):
    """Fetches all message history from the specified group/channel."""
    print("\n--- 2/2: Fetching Channel History (Messages) ---")
    messages = []
    cursor = None
    
    while True:
        try:
            # conversations.history works for public/private channels and DMs
            response = client.conversations_history(
                channel=channel_id,
                cursor=cursor,
                limit=200 # Fetch more per request
            )
            
            if not response["ok"]:
                raise SlackApiError("History API call failed", response)

            messages.extend(response["messages"])
            
            cursor = response.get("response_metadata", {}).get("next_cursor")
            
            if not cursor:
                break # Stop if no more messages

            print(f"Fetched {len(messages)} messages so far. Getting next page...")
            
        except SlackApiError as e:
            print(f"\nFATAL ERROR retrieving messages: {e.response['error']}")
            print("Action needed: Did you add the `groups:history` scope AND invite the App to the group?")
            return None
        except Exception as e:
            print(f"\nAn unexpected error occurred: {e}")
            return None
            
    return messages

# --- MAIN EXECUTION ---
if __name__ == "__main__":
    
    # 1. FETCH AND SAVE USERS
    all_users = fetch_all_users()

    if all_users:
        print(f"Successfully retrieved a total of {len(all_users)} users.")
        with open(OUTPUT_USERS_FILE, 'w', encoding='utf-8') as f:
            json.dump(all_users, f, ensure_ascii=False, indent=4)
        print(f"User data saved to {OUTPUT_USERS_FILE}")
    else:
        print("User data fetch failed. Cannot continue.")
        exit()
        
    # 2. FETCH AND SAVE MESSAGES
    all_messages = fetch_channel_history(CHANNEL_ID)

    if all_messages:
        print(f"\nSuccessfully retrieved a total of {len(all_messages)} messages.")
        with open(OUTPUT_MESSAGES_FILE, 'w', encoding='utf-8') as f:
            json.dump(all_messages, f, ensure_ascii=False, indent=4)
        print(f"Message history saved to {OUTPUT_MESSAGES_FILE}")
        
    print("\n----------------------------------------------------------------")
    print("SUCCESS! Your data is ready.")
    print(f"The file {OUTPUT_MESSAGES_FILE} has your messages.")
    print(f"The file {OUTPUT_USERS_FILE} has the names for the IDs in the message file.")