from flask import Flask, jsonify
from abc import ABC, abstractmethod

app = Flask(__name__)

# 1. Metaprogramming: حقن الخصائص وقت التشغيل
class DataModel:
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value) # Runtime injection

# 2. SOLID (ISP/LSP) & Adapter Pattern: توحيد مصادر البيانات
class SocialProvider(ABC):
    @abstractmethod
    def get_data(self): pass

class TwitterAdapter(SocialProvider):
    def get_data(self):
        return DataModel(platform="Twitter", likes=100, text="Good morning!")

# 3. Chain of Responsibility: معالجة البيانات بالتسلسل
class Processor(ABC):
    def __init__(self, next_proc=None): self.next_proc = next_proc
    def handle(self, data):
        if self.next_proc: return self.next_proc.handle(data)
        return data

class SentimentProcessor(Processor):
    def handle(self, data):
        # منطق بسيط: لو النص فيه كلمة 'sad' يطلع Negative، غير كدا Positive
        if 'sad' in data.text.lower():
            data.sentiment = "Negative"
        else:
            data.sentiment = "Positive"
        return super().handle(data)

# 4. Functional Programming: استخدام Higher-order functions
def apply_workflow(data, workflow_func):
    return workflow_func(data)

from flask import request # ضيف دي فوق مع المكتبات

class AnalyticsService:
    @staticmethod
    def execute(user_text, user_likes):
        provider = TwitterAdapter()
        # هنا بنخلي البيانات تعتمد على اللي اليوزر بعته
        raw_data = DataModel(platform="DynamicSource", likes=user_likes, text=user_text)
        
        pipeline = SentimentProcessor()
        processed_data = pipeline.handle(raw_data)
        
        return apply_workflow(processed_data, lambda d: d.__dict__)

@app.route('/analytics', methods=['GET'])
def get_analytics():
    # بنسحب البيانات من الرابط
    text = request.args.get('text', 'No text provided')
    likes = int(request.args.get('likes', 0))
    
    service = AnalyticsService()
    return jsonify(service.execute(text, likes))
if __name__ == '__main__':
    app.run(debug=True)