(function($, showdown) {
	"use strict";

	var TITLE_SUFFIX = " - Michis.Me";
	var WIKI_URL     = "https://github.com/ManuelBlanc/hearthstone-wiki/wiki/";
	var WIKI_RAW_URL = "https://raw.githubusercontent.com/wiki/ManuelBlanc/hearthstone-wiki/";

	// Clear the "no-javascript" message
	$("#article").html("");

	// Custom showdown filters
	var custom_extensions = function() {
		return [
			{ // Give bootstrap class to tables
				type: "output",
				regex: /<table>/g,
				replace: "<table class='table table-bordered'>",
			},
			{ // Process MediaWiki-type links
				type: "lang",
				regex: /\[\[([^\]]+)\]\]/g,
				replace: function(_, link_text) {
					var link_href = "#!/" + link_text.trim().replace(/\s+/g, "-");
					return "[" + link_text + "]( " + link_href + ")";
				},
			}
		];
	};

	// Create the markdown converter
	var converter = new showdown.Converter({
		tables: true,
		parseImgDimensions: true,
		simplifiedAutoLink: true,
		strikethrough: true,
		extensions: ["hs_markdown", custom_extensions]
	});

	function setLocation(target) {
		document.title = target.replace(/-/g, " ") + TITLE_SUFFIX;
		location.replace(location.href.replace(location.hash, "#!/" + target));
		$("a.ribbon").attr("href", WIKI_URL + target);
	}

	function extractArticleName() {
		var article_name;
		if (/^#!\/[A-Za-z0-9\-]+$/.test(location.hash)) {
			article_name = location.hash.substr(3).trim().replace(/\s+/, "-");
		}
		else {
			article_name = "Home";
		}
		setLocation(article_name);
		return article_name;
	}

	function loadPage() {

		var page_path = extractArticleName();

		$("#article").addClass("loading");

		// Make the request
		$.ajax({
			dataType: "text",
			url: WIKI_RAW_URL + page_path + ".md"
		})
		.done(function(contents, textStatus, jqXHR) {
			// Present it
			$("#article").html(converter.makeHtml(contents));
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			setLocation(jqXHR.status.toString());
			$("#article").html("<h1>" + jqXHR.status + " - " + errorThrown + "</h1>");
		})
		.always(function() {
			$("#article").removeClass("loading");
		});
	}

	$(window).on('hashchange', loadPage);
	loadPage();

})(jQuery, showdown);
