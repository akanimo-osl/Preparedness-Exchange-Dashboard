
# Basic placeholder for AI severity predictor
def predict_severity(data):
    # Placeholder: Replace with real ML model call
    if data.get('cases', 0) > 100:
        return 'critical'
    elif data.get('cases', 0) > 20:
        return 'high'
    else:
        return 'moderate'
