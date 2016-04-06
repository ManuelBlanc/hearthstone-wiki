(function($, showdown) {
	"use strict";

	/* Return the img url for a certain card ID. */
	var hs_img_url = function(id) {
		return "http://wow.zamimg.com/images/hearthstone/cards/enus/medium/" + id + ".png";
	};

	/* Generates the HTML for a span containing the card name */
	var generate_span_for_card = function(_, card_name) {
		// Cleanup the card name
		var key = card_name.replace(/[^A-Za-z ]/g, "").toLowerCase().trim().replace(/ +/g, " ");
		var card = window.card_data[key];
		var span = $("<span>")
			.addClass("hs-card")
			.toggleClass("invalid", !card)
			.attr("data-card-id",   card ? card.id   : "")
			.attr("data-card-name", card ? card.name : "")
			.text("" + (card ? card.name : card_name) + "");
		return span.prop("outerHTML");
	};

	// Register the extension
	var register_showdown_extension = function() {
		showdown.extension("hs_markdown", function(converter) {
			return [
				{ // Card tooltips
					type: "lang",
					regex: /\(\(([A-Za-z '-]+)\)\)/g,
					replace: generate_span_for_card,
				},
				{ // Mana costs
					type: "lang",
					regex: /\{(\d+|[Xx])\}/g,
					replace: "$1<span class='hs-mana'> mana</span>",
				}
			];
		});

		// if we have jQuery Bootstrap then use the popover
		if ($ !== undefined && $.fn.popover !== undefined) {

			$("body").popover({
				viewport: "main",
				selector: ".hs-card:not(.invalid)",
				html: true,
				placement: "auto right",
				trigger: "hover",
				template: "<div class='popover' role='tooltip'><div class='popover-content'></div></div>",
				content: function() {
					var card_id   = $(this).data("card-id");
					var card_name = $(this).data("card-name");
					var img = $("<img>")
						.attr("src", hs_img_url(card_id))
						.attr("alt", card_name);
					return img.prop("outerHTML");
				},
			});
		}
	};

	register_showdown_extension();

})(jQuery, showdown);
