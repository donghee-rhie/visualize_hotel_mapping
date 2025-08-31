import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/api/data")
def get_data():
    # Read the csv files
    property_df = pd.read_csv("property_data.csv")
    catalog_df = pd.read_csv("catalog_data.csv")

    # Merge the dataframes
    merged_df = pd.merge(property_df, catalog_df, on=["name", "address"])
    
    # Convert to dictionary
    data = merged_df.to_dict(orient="records")
    return data