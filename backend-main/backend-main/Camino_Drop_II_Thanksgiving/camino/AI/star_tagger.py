
# Tags STAR data using rule-based or ML NLP
def tag_star_entry(entry):
    tags = []
    if 'ebola' in entry['hazard'].lower():
        tags.append('viral')
    if entry['severity'] == 'critical':
        tags.append('urgent')
    return tags
