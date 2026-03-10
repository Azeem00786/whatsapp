project:
name: whatsapp-channel-follower-sender
goal: >
Send WhatsApp messages to student phone numbers in safe chunks
to invite them to follow a WhatsApp channel. Numbers can be added
through CSV upload or manual multi-number input.

tech_stack:
backend: Node.js
api_framework: Express
automation: Puppeteer
csv_parser: csv-parser
file_upload: multer
storage: JSON_or_SQLite
queue: simple_queue
frontend_optional: simple_html_or_react

modules:

input_sources:

    csv_upload:
      description: Upload CSV containing student numbers
      format:
        columns:
          - name
          - phone
      flow:
        - upload_file
        - validate_csv
        - send_to_csv_parser

    manual_input:
      description: >
        Allow user to paste multiple phone numbers manually.
        Input field supports comma, space, or newline separated numbers.

      ui_component:
        type: textarea
        label: "Paste phone numbers"
        placeholder: |
          9876543210
          9123456789
          9988776655

      accepted_formats:
        - newline_separated
        - comma_separated
        - space_separated

      example_inputs:
        newline: |
          9876543210
          9123456789
          9988776655
        comma: |
          9876543210,9123456789,9988776655
        mixed: |
          9876543210
          9123456789,9988776655

      processing_steps:
        - read_textarea
        - split_numbers
        - normalize_numbers
        - send_to_validator

number_parser:
description: Convert input string into list of phone numbers
steps: - detect_separators - split_by_regex - trim_whitespace - return_array

validator:
description: Clean and validate numbers
rules: - remove_spaces - remove_special_characters - ensure_numeric - ensure_length_10_or_12 - add_country_code_if_missing - remove_duplicates

queue_system:
description: Maintain queue of numbers to send messages
type: FIFO
operations: - enqueue_numbers - dequeue_chunk - mark_as_sent - mark_as_failed

chunk_processor:
description: Process numbers in safe batches
configuration:
chunk_size: 20
delay_between_messages_seconds: 30
delay_between_chunks_seconds: 180
flow: - get_next_chunk - iterate_numbers - call_message_sender - apply_delays

whatsapp_automation:
platform: WhatsApp_Web
library: Puppeteer
steps: - launch_browser - open_whatsapp_web - wait_for_qr_scan - maintain_session - open_chat_with_number - send_message

message_builder:
description: Build invitation message
template: >
Hello 👋
I share useful content for students on my WhatsApp channel.
Follow here:
https://whatsapp.com/channel/CHANNEL_ID

sender:
description: Send message through WhatsApp
steps: - generate_whatsapp_chat_url - open_chat - click_send_button - confirm_sent

logging:
description: Record sending activity
storage: logs/sent.json
fields: - phone - status - timestamp
actions: - save_success - save_failure - prevent_duplicate_sending

rate_limit:
description: Prevent account restrictions
limits:
messages_per_minute: 1
messages_per_hour: 30
messages_per_day: 150
strategy: - random_delay_between_messages - pause_between_chunks - daily_limit_check

api_endpoints:

- POST /upload-csv
- POST /add-numbers
- POST /start-sending
- GET /status
- GET /logs

project_structure:
root: - server - uploads - logs - config

server: - index.js - csvParser.js - manualParser.js - validator.js - queue.js - whatsapp.js - sender.js

uploads: - students.csv

logs: - sent.json

workflow:

- add_numbers_from_csv_or_manual_input
- parse_numbers
- validate_numbers
- enqueue_numbers
- start_sender
- process_in_chunks
- send_messages
- apply_rate_limits
- store_logs

future_improvements:

- web_dashboard
- preview_numbers_before_sending
- message_personalization
- retry_failed_numbers
- redis_queue
- multi_whatsapp_accounts
