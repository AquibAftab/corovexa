import json
import time
import csv
import ssl
import os
import paho.mqtt.client as mqtt


# ============================================================
# COROVEXA – PIPELINE HEALTH MONITORING
# AWS IoT CORE MQTT PUBLISHER
# ============================================================

# -----------------------------
# AWS IoT Core Configuration
# -----------------------------

AWS_IOT_ENDPOINT = "a3c20zhn6k1yet-ats.iot.ap-south-1.amazonaws.com"

CLIENT_ID = "iotconsole-131a35c9-eb3c-4631-bdb0-41edd6d2ad1c"
TOPIC = "COROVEXA/sensor/data"

CA_PATH = "certificates/AmazonRootCA1.pem"
CERT_PATH = "certificates/device-certificate.pem.crt"
KEY_PATH = "certificates/private.pem.key"

CSV_FILE = "Dataset.csv"

# Publishing interval
PUBLISH_INTERVAL = 1


# ============================================================
# CHECK REQUIRED FILES
# ============================================================

required_files = [
    CA_PATH,
    CERT_PATH,
    KEY_PATH,
    CSV_FILE
]

for file_path in required_files:
    if not os.path.exists(file_path):
        raise FileNotFoundError(
            f"Required file not found: {file_path}"
        )


# ============================================================
# MQTT CALLBACK FUNCTIONS
# ============================================================

def on_connect(client, userdata, flags, rc):
    """
    Called when the MQTT client connects to AWS IoT Core.
    """

    if rc == 0:
        print("======================================")
        print("Connected to AWS IoT Core")
        print("Client ID :", CLIENT_ID)
        print("Topic     :", TOPIC)
        print("======================================")

    else:
        print("Connection failed.")
        print("Return code:", rc)


def on_publish(client, userdata, mid):
    """
    Called when a message has been published.
    """

    print(f"Message published successfully | MID: {mid}")


def on_disconnect(client, userdata, rc):
    """
    Called when the MQTT client disconnects.
    """

    print("Disconnected from AWS IoT Core")

    if rc != 0:
        print("Unexpected disconnection. Return code:", rc)


# ============================================================
# CREATE MQTT CLIENT
# ============================================================

client = mqtt.Client(
    client_id=CLIENT_ID
)

# Callback functions
client.on_connect = on_connect
client.on_publish = on_publish
client.on_disconnect = on_disconnect


# ============================================================
# TLS SECURITY CONFIGURATION
# ============================================================

client.tls_set(
    ca_certs=CA_PATH,
    certfile=CERT_PATH,
    keyfile=KEY_PATH,
    tls_version=ssl.PROTOCOL_TLSv1_2
)


# ============================================================
# CONNECT TO AWS IoT CORE
# ============================================================

print("Connecting to AWS IoT Core...")

client.connect(
    AWS_IOT_ENDPOINT,
    8883,
    60
)

# Start MQTT network loop
client.loop_start()

time.sleep(2)


# ============================================================
# PUBLISH DATA FROM CSV
# ============================================================

try:

    with open(
        CSV_FILE,
        "r",
        newline="",
        encoding="utf-8"
    ) as file:

        reader = csv.DictReader(file)

        row_count = 0

        for row in reader:

            # --------------------------------------------
            # Convert CSV data into sensor payload
            # --------------------------------------------

            payload = {

    "node_id": row["Node"],

    "timestamp": row["Timestamp"],

    "thickness": float(
        row["Thickness_mm"]
    ),

    "temperature": float(
        row["Temperature_C"]
    ),

    "moisture": float(
        row["Moisture_percent"]
    ),

    "pressure": float(
        row["Pressure_hPa"]
    ),

    "vibration": float(
        row["Vibration_m_s2"]
    )
}


            # --------------------------------------------
            # Convert payload to JSON
            # --------------------------------------------

            message = json.dumps(
                payload
            )


            # --------------------------------------------
            # Publish message
            # --------------------------------------------

            result = client.publish(
                TOPIC,
                message,
                qos=1
            )


            # --------------------------------------------
            # Check publishing result
            # --------------------------------------------

            if result.rc == mqtt.MQTT_ERR_SUCCESS:

                row_count += 1

                print()
                print("--------------------------------------")
                print(
                    f"Data #{row_count} published"
                )
                print(
                    "Node ID      :",
                    payload["node_id"]
                )
                print(
                    "Timestamp    :",
                    payload["timestamp"]
                )
                print(
                    "Thickness    :",
                    payload["thickness"],
                    "mm"
                )
                print(
                    "Temperature  :",
                    payload["temperature"],
                    "°C"
                )
                print(
                    "Moisture     :",
                    payload["moisture"],
                    "%"
                )
                print(
                    "Pressure     :",
                    payload["pressure"]
                )
                print(
                    "Vibration    :",
                    payload["vibration"]
                )

            else:

                print(
                    "Publish failed. Error:",
                    result.rc
                )


            # Wait before sending next record
            time.sleep(PUBLISH_INTERVAL)


# ============================================================
# ERROR HANDLING
# ============================================================

except FileNotFoundError as error:

    print(
        "File error:",
        error
    )

except ValueError as error:

    print(
        "Invalid sensor value in CSV:",
        error
    )

except KeyboardInterrupt:

    print()
    print("Publisher stopped by user.")


# ============================================================
# SHUTDOWN
# ============================================================

finally:

    print()
    print("Stopping MQTT client...")

    client.loop_stop()

    client.disconnect()

    print("======================================")
    print("All available data has been published.")
    print("Publisher terminated successfully.")
    print("======================================")