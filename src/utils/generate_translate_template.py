"""
A module for generating a translation template based on content in src/redux/initial-state/dev-lang.json
"""

import json
import csv

STRING_FLD = 'strings'
LINK_FLD = 'links'

JSON_URI = '../redux/initial-state/dev-lang.json'
OUTPUT_URI = './trans_out.csv'

CSV_HEADERS = ['text_id', 'links', 'text_org', 'text_new']


def gen():
    with open(JSON_URI) as json_file:
        data = json.load(json_file)

    with open(OUTPUT_URI, mode='w') as employee_file:
        wrt = csv.writer(employee_file, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)

        wrt.writerow(CSV_HEADERS)

        for str_k, str_v in sorted(data[STRING_FLD].items()):
            links = ['{}: {}'.format(k, ik) for k,v in data[LINK_FLD].items()
                     for ik, iv in v.items() if str(iv) == str(str_k)]

            wrt.writerow([str_k, ', '.join(links), str_v, ''])


if __name__ == '__main__':
    gen()