import os
from pathlib import Path

import pandas as pd
import plotly.express as px
import streamlit as st
from dotenv import load_dotenv
from sqlalchemy import create_engine, text


# =========================================================
# PAGE CONFIGURATION
# =========================================================

st.set_page_config(
    page_title="Cyber Location Investigation Simulator",
    page_icon="📍",
    layout="wide"
)


# =========================================================
# LOAD ENVIRONMENT
# =========================================================

PROJECT_ROOT = Path(__file__).resolve().parent
ENV_FILE = PROJECT_ROOT / "backend" / ".env"

load_dotenv(
    dotenv_path=ENV_FILE,
    override=True
)

DATABASE_URL = os.getenv("DATABASE_URL")


# =========================================================
# DATABASE CONNECTION
# =========================================================

@st.cache_resource
def get_engine():
    if not DATABASE_URL:
        raise RuntimeError(
            "DATABASE_URL not found. "
            "Please configure backend/.env"
        )

    return create_engine(
        DATABASE_URL,
        pool_pre_ping=True
    )


# =========================================================
# DATABASE QUERY
# =========================================================

@st.cache_data(ttl=30)
def load_users():

    engine = get_engine()

    query = text("""
        SELECT
            id,
            name,
            phone,
            created_at
        FROM users
        ORDER BY id;
    """)

    with engine.connect() as connection:
        return pd.read_sql(query, connection)


@st.cache_data(ttl=30)
def load_towers():

    engine = get_engine()

    query = text("""
        SELECT
            id,
            tower_id,
            area,
            latitude,
            longitude
        FROM towers
        ORDER BY id;
    """)

    with engine.connect() as connection:
        return pd.read_sql(query, connection)


@st.cache_data(ttl=30)
def load_locations(user_id):

    engine = get_engine()

    query = text("""
        SELECT
            l.id,
            l.user_id,
            l.tower_id,
            t.tower_id AS tower_code,
            t.area,
            l.latitude,
            l.longitude,
            l.accuracy,
            l.recorded_at
        FROM location_logs l

        INNER JOIN towers t
            ON t.id = l.tower_id

        WHERE l.user_id = :user_id

        ORDER BY l.recorded_at ASC;
    """)

    with engine.connect() as connection:
        return pd.read_sql(
            query,
            connection,
            params={
                "user_id": int(user_id)
            }
        )


# =========================================================
# HEADER
# =========================================================

st.title(
    "📍 Cyber Location Investigation Simulator"
)

st.caption(
    "Educational / simulated mobile location investigation dashboard"
)


# =========================================================
# SIDEBAR
# =========================================================

st.sidebar.header("🔎 Investigation")

try:

    users = load_users()
    towers = load_towers()

except Exception as error:

    st.error(
        "Database connection failed."
    )

    st.code(
        str(error)
    )

    st.info(
        "Check PostgreSQL and backend/.env"
    )

    st.stop()


if users.empty:

    st.warning(
        "No users found in the database."
    )

    st.stop()


selected_user_id = st.sidebar.selectbox(
    "Select Simulated User",
    users["id"].tolist(),
    format_func=lambda user_id: (
        f"{users.loc[users['id'] == user_id, 'name'].iloc[0]}"
        f" — ID {user_id}"
    )
)


# =========================================================
# SELECTED USER
# =========================================================

selected_user = users[
    users["id"] == selected_user_id
].iloc[0]


locations = load_locations(
    selected_user_id
)


# =========================================================
# USER INFORMATION
# =========================================================

st.subheader("👤 User Information")

info_col1, info_col2, info_col3 = st.columns(3)

with info_col1:

    st.metric(
        "User ID",
        int(selected_user["id"])
    )

with info_col2:

    st.metric(
        "Name",
        selected_user["name"]
    )

with info_col3:

    st.metric(
        "Simulated Phone",
        selected_user["phone"]
    )


# =========================================================
# INVESTIGATION SUMMARY
# =========================================================

st.subheader("📊 Investigation Summary")

summary_col1, summary_col2, summary_col3, summary_col4 = st.columns(4)

with summary_col1:

    st.metric(
        "Location Records",
        len(locations)
    )

with summary_col2:

    unique_towers = (
        locations["tower_id"].nunique()
        if not locations.empty
        else 0
    )

    st.metric(
        "Towers Visited",
        unique_towers
    )

with summary_col3:

    if not locations.empty:
        latest = locations.iloc[-1]

        latest_lat = latest["latitude"]
        latest_lon = latest["longitude"]

        st.metric(
            "Latest Latitude",
            f"{latest_lat:.6f}"
        )

    else:

        st.metric(
            "Latest Latitude",
            "N/A"
        )


with summary_col4:

    if not locations.empty:

        st.metric(
            "Latest Longitude",
            f"{latest_lon:.6f}"
        )

    else:

        st.metric(
            "Latest Longitude",
            "N/A"
        )


# =========================================================
# LATEST LOCATION
# =========================================================

if locations.empty:

    st.warning(
        "No location history available for this user."
    )

    st.stop()


latest = locations.iloc[-1]


st.subheader("📍 Latest Simulated Location")

latest_col1, latest_col2, latest_col3, latest_col4 = st.columns(4)

with latest_col1:

    st.write("**Tower**")
    st.write(latest["tower_code"])


with latest_col2:

    st.write("**Area**")
    st.write(latest["area"])


with latest_col3:

    st.write("**Latitude**")
    st.write(f"{latest['latitude']:.6f}")


with latest_col4:

    st.write("**Longitude**")
    st.write(f"{latest['longitude']:.6f}")


# =========================================================
# MOVEMENT DIRECTION
# =========================================================

st.subheader("🧭 Movement Analysis")

if len(locations) >= 2:

    first_point = locations.iloc[0]
    last_point = locations.iloc[-1]

    latitude_change = (
        last_point["latitude"]
        - first_point["latitude"]
    )

    longitude_change = (
        last_point["longitude"]
        - first_point["longitude"]
    )

    if abs(latitude_change) < 0.0005:

        vertical_direction = "Stable"

    elif latitude_change > 0:

        vertical_direction = "North"

    else:

        vertical_direction = "South"


    if abs(longitude_change) < 0.0005:

        horizontal_direction = "Stable"

    elif longitude_change > 0:

        horizontal_direction = "East"

    else:

        horizontal_direction = "West"


    direction = (
        f"{vertical_direction} / "
        f"{horizontal_direction}"
    )

else:

    direction = "Insufficient Data"


st.info(
    f"Estimated simulated movement direction: **{direction}**"
)


# =========================================================
# MOVEMENT CHART
# =========================================================

st.subheader("📈 Movement Timeline")

chart_data = locations.copy()

chart_data["recorded_at"] = pd.to_datetime(
    chart_data["recorded_at"]
)


fig = px.line(
    chart_data,
    x="recorded_at",
    y=["latitude", "longitude"],
    markers=True,
    title="Simulated Latitude / Longitude History"
)

fig.update_layout(
    xaxis_title="Time",
    yaxis_title="Coordinate Value",
    legend_title="Coordinate"
)

st.plotly_chart(
    fig,
    use_container_width=True
)


# =========================================================
# MAP
# =========================================================

st.subheader("🗺️ Simulated Movement Map")

map_data = locations[
    [
        "latitude",
        "longitude",
        "tower_code",
        "area",
        "recorded_at"
    ]
].copy()

map_data["recorded_at"] = (
    map_data["recorded_at"]
    .astype(str)
)


map_fig = px.scatter_map(
    map_data,
    lat="latitude",
    lon="longitude",
    hover_name="tower_code",
    hover_data=[
        "area",
        "recorded_at"
    ],
    zoom=11,
    height=550
)

map_fig.update_layout(
    map_style="open-street-map",
    margin={
        "r": 0,
        "t": 0,
        "l": 0,
        "b": 0
    }
)

st.plotly_chart(
    map_fig,
    use_container_width=True
)


# =========================================================
# LOCATION HISTORY
# =========================================================

st.subheader("📋 Location History")

history_display = locations[
    [
        "tower_code",
        "area",
        "latitude",
        "longitude",
        "accuracy",
        "recorded_at"
    ]
].copy()

history_display.columns = [
    "Tower",
    "Area",
    "Latitude",
    "Longitude",
    "Accuracy",
    "Recorded At"
]

st.dataframe(
    history_display,
    use_container_width=True,
    hide_index=True
)


# =========================================================
# TOWER INFORMATION
# =========================================================

st.subheader("📡 Simulated Tower Network")

tower_display = towers[
    [
        "tower_id",
        "area",
        "latitude",
        "longitude"
    ]
].copy()

tower_display.columns = [
    "Tower ID",
    "Area",
    "Latitude",
    "Longitude"
]

st.dataframe(
    tower_display,
    use_container_width=True,
    hide_index=True
)


# =========================================================
# FOOTER
# =========================================================

st.divider()

st.caption(
    "⚠️ Educational simulator only. "
    "All users, phone numbers, towers and location records "
    "are simulated. This application does not perform "
    "real-world mobile-number tracking or access telecom "
    "operator data."
)