
# Rule Engine for Custom Alert Conditions
def evaluate_alert(data, rules):
    results = []
    for rule in rules:
        if eval(rule['condition'], {}, data):
            results.append(rule['action'])
    return results

# Example:
# rules = [{"condition": "data['severity'] > 3 and data['country'] == 'NG'", "action": "Trigger Alert"}]
