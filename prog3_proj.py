from flask import Flask, request, jsonify
from abc import ABC, abstractmethod
import sqlite3

app = Flask(__name__)

# --- 1. Database Layer ---
def db_connection():
    conn = sqlite3.connect("analytics.sqlite")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            platform TEXT NOT NULL,
            likes INTEGER,
            sentiment TEXT,
            content TEXT
        )
    """)
    conn.commit()
    return conn

# --- 2. Metaprogramming & Models ---
class AnalyticsModel:
    def __init__(self, **entries):
        for key, value in entries.items():
            setattr(self, key, value)
    def to_dict(self):
        return self.__dict__

# --- 3. Logic & Patterns (SOLID) ---
class UniversalAdapter:
    def fetch_data(self, platform, text, likes):
        return AnalyticsModel(platform=platform, likes=likes, content=text)

class SentimentAnalyzer:
    def process(self, data):
        text = data.content.lower()
        if any(word in text for word in ["good", "happy", "great", "excellent", "عاش", "جميل"]):
            data.sentiment = "Positive"
        elif any(word in text for word in ["bad", "sad", "hate", "poor", "سيء", "وحش"]):
            data.sentiment = "Negative"
        else:
            data.sentiment = "Neutral"
        return data

# --- 4. Service Layer ---
class AnalyticsService:
    @staticmethod
    def run_pipeline(platform, text, likes):
        # تنفيذ الـ Adapter مع المنصة المختارة
        provider = UniversalAdapter()
        raw_data = provider.fetch_data(platform, text, likes)
        
        processor = SentimentAnalyzer()
        processed_data = processor.process(raw_data)
        
        conn = db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO reports (platform, likes, sentiment, content) VALUES (?, ?, ?, ?)",
                       (processed_data.platform, processed_data.likes, processed_data.sentiment, processed_data.content))
        conn.commit()
        return processed_data.to_dict()

# --- 5. UI Templates ---

HTML_HEAD = """
<head>
    <meta charset="UTF-8">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { background-color: #f0f2f5; font-family: 'Segoe UI', Tahoma, sans-serif; }
        .card { border: none; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
        .btn-primary { background-color: #0d6efd; border-radius: 8px; padding: 10px; }
        .sentiment-Positive { color: #198754; font-weight: bold; }
        .sentiment-Negative { color: #dc3545; font-weight: bold; }
        .sentiment-Neutral { color: #6c757d; font-weight: bold; }
        .platform-badge { font-size: 0.8rem; padding: 5px 10px; border-radius: 20px; background: #e9ecef; }
    </style>
</head>
"""

@app.route('/analytics/generate', methods=['GET', 'POST'])
def generate_report():
    if request.method == 'POST':
        # استلام المنصة المختارة من الـ Form
        platform = request.form.get('platform', 'Unknown')
        text = request.form.get('content', '')
        likes = int(request.form.get('likes', 0))
        
        result = AnalyticsService.run_pipeline(platform, text, likes)
        
        return f"""
        {HTML_HEAD}
        <div class="container mt-5">
            <div class="row justify-content-center">
                <div class="col-md-6 card p-4 text-center">
                    <h2 class="text-primary mb-4">Done! ✅</h2>
                    <div class="text-start bg-light p-3 rounded">
                        <p><strong>Platform:</strong> <span class="badge bg-info text-dark">{result['platform']}</span></p>
                        <p><strong>Content:</strong> {result['content']}</p>
                        <p><strong>Sentiment:</strong> <span class="sentiment-{result['sentiment']}">{result['sentiment']}</span></p>
                    </div>
                    <div class="mt-4">
                        <a href="/analytics/generate" class="btn btn-outline-primary">New Analysis</a>
                        <a href="/analytics/reports/view" class="btn btn-primary">History Log</a>
                    </div>
                </div>
            </div>
        </div>
        """
    
    return f"""
    {HTML_HEAD}
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-6 card p-4">
                <h2 class="text-center mb-4">📊 Analytics Generator</h2>
                <form method="post">
                    <div class="mb-3">
                        <label class="form-label">Select Platform</label>
                        <select name="platform" class="form-select">
                            <option value="Facebook">Facebook</option>
                            <option value="Twitter">Twitter (X)</option>
                            <option value="Instagram">Instagram</option>
                            <option value="LinkedIn">LinkedIn</option>
                            <option value="TikTok">TikTok</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Post Content</label>
                        <textarea name="content" class="form-control" rows="3" placeholder="Paste the post text here..." required></textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Likes</label>
                        <input type="number" name="likes" class="form-control" value="0">
                    </div>
                    <button type="submit" class="btn btn-primary w-100">Analyze & Save to DB</button>
                </form>
            </div>
        </div>
    </div>
    """

@app.route('/analytics/reports/view', methods=['GET'])
def view_reports_html():
    conn = db_connection()
    cursor = conn.execute("SELECT * FROM reports ORDER BY id DESC")
    rows = cursor.fetchall()
    
    table_rows = ""
    for row in rows:
        table_rows += f"""
        <tr>
            <td>{row[0]}</td>
            <td><span class="platform-badge">{row[1]}</span></td>
            <td>{row[4]}</td>
            <td>{row[2]}</td>
            <td class="sentiment-{row[3]}">{row[3]}</td>
        </tr>
        """
    
    return f"""
    {HTML_HEAD}
    <div class="container mt-5">
        <div class="card p-4">
            <h3 class="mb-4 text-secondary">Historical Data Log</h3>
            <div class="table-responsive">
                <table class="table align-middle table-hover">
                    <thead class="table-light">
                        <tr><th>ID</th><th>Platform</th><th>Content</th><th>Likes</th><th>Sentiment</th></tr>
                    </thead>
                    <tbody>{table_rows}</tbody>
                </table>
            </div>
            <a href="/analytics/generate" class="btn btn-link">← Back to Generator</a>
        </div>
    </div>
    """

if __name__ == '__main__':
    app.run(debug=True)