import mysql.connector

def connect_to_database():
    conn = mysql.connector.connect(
        host="trading.cpn3xlmmzatc.us-east-2.rds.amazonaws.com",
        db='trading',
        user="admin",
        password="MohitBhaiya$123",
        connection_timeout=60
    )
    print("***NEW CONNECTION **")
    return conn

cur = connect_to_database().cursor()

print (connect_to_database())


