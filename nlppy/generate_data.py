import pandas as pd
import random
from faker import Faker

fake = Faker()

departments = {
    'Cleanliness': 'Housekeeping',
    'Delay': 'Operations',
    'Food Quality': 'Catering',
    'Staff Behavior': 'HR',
    'Safety': 'Security',
    'Ticketing': 'Ticketing',
    'Other': 'Customer Support'
}

# Define some keywords for each category to make synthetic data realistic
category_keywords = {
    'Cleanliness': ['dirty', 'toilet', 'clean', 'hygiene', 'filthy', 'unclean', 'bathroom'],
    'Delay': ['late', 'delay', 'delayed', 'on time', 'punctual', 'waiting'],
    'Food Quality': ['food', 'meal', 'dinner', 'breakfast', 'taste', 'stale', 'catering'],
    'Staff Behavior': ['staff', 'rude', 'behavior', 'helpful', 'attendant', 'cooperative'],
    'Safety': ['safety', 'security', 'accident', 'theft', 'danger', 'unsafe'],
    'Ticketing': ['ticket', 'booking', 'seat', 'reservation', 'price', 'refund', 'conductor']
}

def generate_complaint(category):
    keywords = category_keywords.get(category, ['issue'])
    text = f"I am facing an issue with {random.choice(keywords)}. {fake.sentence()}"
    return text

data = []
for _ in range(1000):
    cat = random.choice(list(departments.keys()))
    text = generate_complaint(cat)
    priority = random.choice(['Low', 'Medium', 'High'])
    train = str(random.randint(10000, 99999))
    location = fake.city()
    department = departments[cat]
    data.append([text, cat, priority, train, location, department])

df = pd.DataFrame(data, columns=['complaint_text', 'category', 'priority', 'train_number', 'location', 'department'])
df.to_csv('complaints.csv', index=False)