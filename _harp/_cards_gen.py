#!/usr/bin/env python

import urllib, json, re, sys


URL_CARDS_JSON = "https://api.hearthstonejson.com/v1/latest/all/cards.collectible.json"

card_list = json.load(urllib.urlopen(URL_CARDS_JSON))


pretty_options = {
	"ensure_ascii"	: False,
	"sort_keys"   	: True,
	"indent"      	: 4,
	"separators"  	: (",", ": ")
}

cards_dict = {
	re.sub(r"[^A-Za-z ]", "", card["name"]["enUS"]).lower(): {
		"id"   : card["id"],
		"name" : card["name"]["esES"]
	}
	for card in card_list
}

with open("card_data.js", "w") as out:
	out.write("window.card_data = ");
	out.write(json.dumps(cards_dict, ensure_ascii=False).encode("utf8"))
	out.write(";");
