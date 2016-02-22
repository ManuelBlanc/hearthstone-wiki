(function($, showdown) {
	"use strict";

	$.when(
		$.getJSON("/cards.json"),
		$.ajax({dataType: "text", url: "/articles/arena.mdown"})
	)
	.done(function(cards, article_md) {

		cards = cards[0];
		article_md = article_md[0];

		function spanify_cards(_, card_name) {
			var key = card_name.replace(/[^\x00-\x7F]/g, "").toLowerCase().trim().replace(/ +/g, " ");
			var card = cards[key];
			var span = $("<span>")
				.addClass("hs-card")
				.toggleClass("invalid", !card)
				.attr("data-card-id",   card ? card.id   : "")
				.attr("data-card-name", card ? card.name : "")
				.text("" + (card ? card.name : card_name) + "");
			return span.prop('outerHTML');
		}

		showdown.extension("hs_markdown", function(converter) {
			return [
				{ // Card tooltips
					type: "lang",
					regex: /\[\[(['A-Za-z ]+)\]\]/g,
					replace: spanify_cards,
				},
				{ // Mana costs
					type: "lang",
					regex: /\{(\d+|[Xx])\}/g,
					replace: "$1<span class='hs-mana'> mana</span>",
				}
			];
		})

		var hs_img_url = function(id) {
			//return "https://raw.githubusercontent.com/LightStrawberry/hearthstone/master/" + id + ".png"
			//return "//wow.zamimg.com/images/hearthstone/cards/eses/medium/" + id + ".png"
			return "//wow.zamimg.com/images/hearthstone/cards/enus/medium/" + id + ".png"
		}

		var bootstrap_table = function() {
			return [{
				type: "output",
				regex: /<table>/g,
				replace: "<table class='table table-bordered'>"
			}];
		}

		var converter = new showdown.Converter({
			tables: true,
			parseImgDimensions: true,
			simplifiedAutoLink: true,
			strikethrough: true,
			extensions: ["hs_markdown", bootstrap_table]
		});
		$("#article").html(
			converter.makeHtml(article_md)
		);


		$(".hs-card:not(.invalid)").popover({
			container: "body",
			html: true,
			placement: "right",
			trigger: "hover",
			template: "<div class='popover' role='tooltip'><div class='popover-content'></div></div>",
			content: function() {
				var card_id   = $(this).data("card-id");
				var card_name = $(this).data("card-name");
				var img = $("<img>")
					.attr("src", hs_img_url(card_id))
					.attr("alt", card_name);
				return img.prop('outerHTML');
			},
		});

	});

})(jQuery, showdown);
