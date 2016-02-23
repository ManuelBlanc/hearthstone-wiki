(function($, showdown) {
	"use strict";

	var TITLE_SUFFIX = " - MiChis.me";
	var WIKI_URL     = "https://github.com/ManuelBlanc/hearthstone-wiki/wiki/";
	var WIKI_RAW_URL = "https://raw.githubusercontent.com/wiki/ManuelBlanc/hearthstone-wiki/";

	// Clear the "no-javascript" message
	$("#main").html("");

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

	// 
	function setLocation(slug) {
		document.title = slug.replace(/-/g, " ") + TITLE_SUFFIX;
		history.pushState(null, "", "#!/" + slug)
		$("a.ribbon").attr("href", WIKI_URL + slug);
	}

	function extractArticleName() {
		var article_name = null;
		if (/^#!\/[a-z][a-z0-9\-]+$/i.test(location.hash)) {
			article_name = location.hash.substr(3).trim().replace(/\s+/, "-");
		}
		return article_name;
	}


	function loadPage() {

		var page_path = extractArticleName();

		if (page_path === null) {
			page_path = "Home";
			setLocation("Home");
		}

		$("#main").addClass("loading");

		// Make the request
		$.ajax({
			dataType: "text",
			url: WIKI_RAW_URL + page_path + ".md"
		})
		.done(function(contents, textStatus, jqXHR) {
			// Present it
			setTimeout(function() { $("#main").html(converter.makeHtml(contents)); }, 1000);
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			$("#main").html(
				"<h1>" + jqXHR.status + " - " + errorThrown + "</h1>" +
				"<p class='lead'>Go " + 
					"<a href='javascript:history.back();void(0);'>back</a>" +
					" or go " +
					"<a href='#!/Home'>home</a>." +
				"</p>"
			);
		})
		.always(function() {
			setTimeout(function() { $("#main").removeClass("loading"); }, 1000);
		});
	}

	$(window).on('hashchange', loadPage);
	loadPage();

})(jQuery, showdown);
