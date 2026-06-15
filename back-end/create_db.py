import pymysql
from config import Config

def create_db():
    try:
        c = pymysql.connect(
            host=Config.DB_HOST, 
            user=Config.DB_USER, 
            password=Config.DB_PASSWORD, 
            port=Config.DB_PORT
        )
        cursor = c.cursor()
        cursor.execute(f'CREATE DATABASE IF NOT EXISTS {Config.DB_NAME} DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci')
        c.commit()
        c.close()
        print(f"Database {Config.DB_NAME} created successfully.")
    except Exception as e:
        print("Error creating DB:", e)

if __name__ == "__main__":
    create_db()
