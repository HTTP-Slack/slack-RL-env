# Import libraries
from bson import ObjectId
import pandas as pd
import json
import os
import secrets
import datetime
import numpy as np

print("Successfully imported all libraries.")

# Function to generate a new ObjectId
def generate_id():
    """Generates a new MongoDB ObjectId."""
    return ObjectId()

def id_to_key(val):
    """Converts the ObjectId to a string for mapping."""
    return str(val)

print("Starting data transformation script...")

# --- Helper Functions (MODIFIED) ---

def convert_slack_ts(ts):
    """Converts Slack timestamp (float string) to datetime."""
    if pd.isna(ts):
        return None
    try:
        return datetime.datetime.fromtimestamp(float(ts))
    except (ValueError, TypeError):
        return None

def create_role(row):
    """Maps admin/owner status to a role string."""
    if row['is_owner'] == 1.0:
        return 'owner'
    if row['is_admin'] == 1.0:
        return 'admin'
    return 'user'

def create_username(row):
    """Creates a username, falling back from display_name to real_name to name."""
    display_name = row.get('display_name', '') or ''
    real_name_x = row.get('real_name_x', '') or ''
    name = row.get('name', '') or ''
    email = row.get('email', '') or ''
    
    if pd.notna(display_name) and str(display_name).strip():
        return display_name
    if pd.notna(real_name_x) and str(real_name_x).strip():
        return real_name_x
    if pd.notna(name) and str(name).strip():
        return name
    # Fallback to email prefix IF email exists
    if pd.notna(email) and '@' in email:
        return email.split('@')[0]
    return f"user_{row.get('original_id', 'unknown')}"

def transform_reactions(reactions_list, user_map):
    """Transforms reactions and returns string IDs."""
    if not isinstance(reactions_list, list):
        return []
    
    transformed_list = []
    for reaction in reactions_list:
        if not isinstance(reaction, dict) or 'name' not in reaction or 'users' not in reaction:
            continue
        
        reacted_by_strings = []
        if isinstance(reaction['users'], list):
            for user_id in reaction['users']:
                if user_id in user_map:
                    # Convert the ObjectId to string immediately
                    reacted_by_strings.append(str(user_map[user_id]))
        
        transformed_list.append({
            'emoji': reaction['name'],
            'reactedToBy': reacted_by_strings
        })
    return transformed_list

def map_user_list(user_list, user_map):
    """Maps a list of user IDs to a list of string IDs."""
    if not isinstance(user_list, list):
        return []
    # Convert the ObjectId to string immediately
    return [str(user_map[user_id]) for user_id in user_list if user_id in user_map]

def clean_text(text):
    """Manually cleans a string to remove unsupported UTF-8 characters."""
    if not isinstance(text, str):
        return text
    # Re-encode the string to 'latin-1' (which accepts all bytes)
    # then decode it as 'utf-8' with errors replaced by '?'
    return text.encode('latin-1', 'ignore').decode('utf-8', 'replace')

# --- Initialize maps in global scope ---
user_id_map = {}
message_id_map = {}
conversation_mongo_id = None
parent_messages_df = pd.DataFrame()
thread_replies_df = pd.DataFrame()

# --- 1. Load Data ---
try:
    users_df = pd.read_json('all_users.json')
    messages_df = pd.read_json('C07GJFVLYKS_messages.json')
    print("Successfully loaded JSON files.")
except FileNotFoundError as e:
    print(f"Error: {e}")
    print("Please make sure 'all_users.json' and 'C07GJFVLYKS_messages.json' are in the same folder as the script.")
except Exception as e:
    print(f"Error loading JSON files: {e}. Exiting.")
    raise

# --- 2. Process Users ---
print("Processing users...")
try:
    # (Same processing logic as before...)
    profile_df = users_df['profile'].apply(pd.Series)
    users_df = users_df.join(profile_df, rsuffix='_profile')
    if 'email' not in users_df.columns and 'email_profile' in users_df.columns:
        users_df['email'] = users_df['email_profile']
    if 'email' not in users_df.columns: 
        users_df['email'] = np.nan
        
    if 'display_name' not in users_df.columns: users_df['display_name'] = np.nan
    if 'phone' not in users_df.columns: users_df['phone'] = np.nan
    if 'real_name_x' not in users_df.columns and 'real_name' in users_df.columns:
         users_df['real_name_x'] = users_df['real_name']
    elif 'real_name_x' not in users_df.columns:
         users_df['real_name_x'] = np.nan

    # Removed email filter
    users_filtered_df = users_df[
        (users_df['is_bot'] == False) &
        (users_df['deleted'] == False) &
        (users_df['id'] != 'USLACKBOT')
    ].copy()

    users_filtered_df['original_id'] = users_filtered_df['id']
    users_filtered_df['_id'] = [generate_id() for _ in range(len(users_filtered_df))]
    
    user_id_map.update(pd.Series(users_filtered_df['_id'].values, index=users_filtered_df['original_id']).to_dict())
    
    user_id_map_df = pd.DataFrame(user_id_map.items(), columns=['original_id', 'mongo_id'])
    user_id_map_df['mongo_id'] = user_id_map_df['mongo_id'].apply(str)
    user_id_map_df.to_csv('user_id_map.csv', index=False)
    print(f"Created user_id_map.csv with {len(user_id_map_df)} users.")

    users_transformed_df = pd.DataFrame()
    users_transformed_df['_id'] = users_filtered_df['_id'].apply(str) 
    
    # *** MANUALLY CLEANING TEXT FIELDS ***
    users_transformed_df['username'] = users_filtered_df.apply(create_username, axis=1).apply(clean_text)
    users_transformed_df['email'] = users_filtered_df['email'].apply(clean_text)
    
    users_transformed_df['password'] = [secrets.token_urlsafe(10) for _ in range(len(users_transformed_df))]
    users_transformed_df['googleId'] = None
    users_transformed_df['isOnline'] = False
    users_transformed_df['role'] = users_filtered_df.apply(create_role, axis=1)
    users_transformed_df['phone'] = users_filtered_df['phone']
    users_transformed_df['profilePicture'] = None
    users_transformed_df['profilePictureMimeType'] = None
    
    timestamps = users_filtered_df['updated'].apply(convert_slack_ts)
    users_transformed_df['createdAt'] = timestamps
    users_transformed_df['updatedAt'] = timestamps

    # *** REMOVED encoding_errors argument ***
    users_transformed_df.to_json('users_transformed.jsonl', orient='records', lines=True)
    print(f"Created users_transformed.jsonl with {len(users_transformed_df)} users.")

except Exception as e:
    print(f"Error processing users: {e}")
    raise

# --- 3. Process Messages & Threads ---
print("Processing messages and threads...")
try:
    valid_messages_df = messages_df[
        (messages_df['type'] == 'message') &
        (messages_df['subtype'].isna() | (messages_df['subtype'] == 'thread_broadcast'))
    ].copy()

    parent_messages_df = valid_messages_df[valid_messages_df['root'].isna()].copy()
    thread_replies_df = valid_messages_df[valid_messages_df['root'].notna()].copy()

    print(f"Found {len(parent_messages_df)} parent messages and {len(thread_replies_df)} thread replies.")

    conversation_mongo_id = generate_id()
    print(f"Using static Conversation ID: {id_to_key(conversation_mongo_id)}")

    # --- Process Parent Messages ---
    messages_transformed_df = pd.DataFrame()
    parent_messages_df = parent_messages_df.copy()
    parent_messages_df['_id'] = [generate_id() for _ in range(len(parent_messages_df))]
    
    message_id_map.update(pd.Series(parent_messages_df['_id'].values, index=parent_messages_df['ts'].astype(str)).to_dict())
    message_id_map_df = pd.DataFrame(message_id_map.items(), columns=['original_ts', 'mongo_id'])
    message_id_map_df['mongo_id'] = message_id_map_df['mongo_id'].apply(str)
    message_id_map_df.to_csv('message_id_map.csv', index=False)
    print("Created message_id_map.csv")
    
    messages_transformed_df['_id'] = parent_messages_df['_id'].apply(str)
    messages_transformed_df['sender'] = parent_messages_df['user'].map(user_id_map).apply(lambda x: str(x) if pd.notna(x) else None)
    
    # *** MANUALLY CLEANING TEXT FIELDS ***
    messages_transformed_df['content'] = parent_messages_df['text'].apply(clean_text)
    
    messages_transformed_df['attachments'] = [[] for _ in range(len(parent_messages_df))]
    messages_transformed_df['channel'] = None 
    messages_transformed_df['organisation'] = None
    messages_transformed_df['conversation'] = str(conversation_mongo_id)
    messages_transformed_df['collaborators'] = [[] for _ in range(len(parent_messages_df))]
    
    messages_transformed_df['reactions'] = parent_messages_df['reactions'].apply(
        transform_reactions, args=(user_id_map,)
    )
    messages_transformed_df['threadReplies'] = parent_messages_df['reply_users'].apply(
        map_user_list, args=(user_id_map,)
    )
    
    messages_transformed_df['threadRepliesCount'] = parent_messages_df['reply_count'].fillna(0)
    messages_transformed_df['threadLastReplyDate'] = parent_messages_df['latest_reply'].apply(convert_slack_ts)
    messages_transformed_df['isBookmarked'] = False
    messages_transformed_df['isSelf'] = False
    messages_transformed_df['hasRead'] = False
    messages_transformed_df['type'] = parent_messages_df['type']
    
    timestamps = parent_messages_df['ts'].apply(convert_slack_ts)
    messages_transformed_df['createdAt'] = timestamps
    messages_transformed_df['updatedAt'] = timestamps
    
    # Drop messages where the sender was not found
    messages_transformed_df = messages_transformed_df.dropna(subset=['sender'])

    # *** REMOVED encoding_errors argument ***
    messages_transformed_df.to_json('messages_transformed.jsonl', orient='records', lines=True)
    print(f"Created messages_transformed.jsonl with {len(messages_transformed_df)} messages.")

    # --- Process Thread Replies ---
    threads_transformed_df = pd.DataFrame()
    thread_replies_df = thread_replies_df.copy()
    threads_transformed_df['_id'] = [generate_id() for _ in range(len(thread_replies_df))]
    threads_transformed_df['sender'] = thread_replies_df['user'].map(user_id_map).apply(lambda x: str(x) if pd.notna(x) else None)
    
    # *** MANUALLY CLEANING TEXT FIELDS ***
    threads_transformed_df['content'] = thread_replies_df['text'].apply(clean_text)
    
    threads_transformed_df['message'] = thread_replies_df['thread_ts'].astype(str).map(message_id_map).apply(lambda x: str(x) if pd.notna(x) else None)
    
    threads_transformed_df['reactions'] = thread_replies_df['reactions'].apply(
        transform_reactions, args=(user_id_map,)
    )
    
    threads_transformed_df['isBookmarked'] = False
    threads_transformed_df['hasRead'] = False

    timestamps = thread_replies_df['ts'].apply(convert_slack_ts)
    threads_transformed_df['createdAt'] = timestamps
    threads_transformed_df['updatedAt'] = timestamps

    # Drop threads where sender or parent message was not found
    threads_transformed_df = threads_transformed_df.dropna(subset=['message', 'sender'])
    
    # *** REMOVED encoding_errors argument ***
    threads_transformed_df.to_json('threads_transformed.jsonl', orient='records', lines=True)
    print(f"Created threads_transformed.jsonl with {len(threads_transformed_df)} threads.")

except Exception as e:
    print(f"Error processing messages or threads: {e}")
    raise

# --- 4. Process Conversation (Placeholder) ---
print("Creating conversation placeholder...")
try:
    all_user_ids_in_channel = pd.concat([
        parent_messages_df['user'],
        thread_replies_df['user']
    ]).unique()
    
    # This now returns a list of strings
    collaborator_strings = map_user_list(all_user_ids_in_channel, user_id_map)
    
    now = datetime.datetime.now()
    
    conversation_placeholder_df = pd.DataFrame({
        '_id': [str(conversation_mongo_id)],
        'name': ['Channel C07GJFVLYKS'], 
        'collaborators': [collaborator_strings], # Assign the list of strings directly
        'description': [f'This conversation represents the Slack channel C07GJFVLYKS'],
        'isSelf': [False],
        'isConversation': [True],
        'organisation': [None],
        'createdBy': [None],
        'isOnline': [False],
        'hasNotOpen': [[]], # Assign an empty list
        'createdAt': [now],
        'updatedAt': [now]
    })
    
    # *** REMOVED encoding_errors argument ***
    conversation_placeholder_df.to_json('conversation_transformed.jsonl', orient='records', lines=True)
    print("Created conversation_transformed.jsonl")

except Exception as e:
    print(f"Error creating conversation placeholder: {e}")
    raise

print("--- Transformation Script Finished ---")
print("All 4 .jsonl files have been created successfully.")
print("You can now use these .jsonl files with the 'mongoimport' command.")