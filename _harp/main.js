(function($, showdown) {
	"use strict";

	var GIT_USER  = "ManuelBlanc";
	var REPO_NAME = "hearthstone-wiki";
	var TITLE_SUFFIX = " : Wiki Guias";

	var USER_REPO    = GIT_USER + "/" + REPO_NAME;
	var WIKI_URL     = "https://github.com/" + USER_REPO + "/wiki/";
	var WIKI_RAW_URL = "https://raw.githubusercontent.com/wiki/" + USER_REPO + "/";

	// Clear the "no-javascript" message
	$("#main").html("");

	// Custom showdown filters
	var custom_extensions = function() {
		return [
			{ // Process MediaWiki-type links
				type: "lang",
				regex: /\[\[([^\]]+)\]\]/g,
				replace: function(_, link_text) {
					var link_href = "?p=" + link_text.trim().replace(/\s+/g, "-");
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

	function setLocation(slug) {
		document.title = slug.replace(/-/g, " ") + TITLE_SUFFIX;
		$("a.ribbon").attr("href", WIKI_URL + slug);
	}

	function getSlugFromURL() {
		var article_name = null;
		if (/^\?p=[a-z][a-z0-9\-]+$/i.test(location.search)) {
			article_name = location.search.substr(3).trim();
		}
		return article_name;
	}

	function upgradeTables(selector) {
		$(selector).find("table").each(function() {
			$(this)
				.addClass("table table-bordered")
				.wrap("<div class='table-responsive'>");
		});
	}


	function loadPage() {

		var slug = getSlugFromURL();

		if (slug === null) {
			history.replaceState(null, "", "?p=Home");
			slug = "Home";
		}

		setLocation(slug);
		$("#main").addClass("loading");

		// Make the request
		$.ajax({
			dataType: "text",
			url: WIKI_RAW_URL + slug + ".md"
		})
		.done(function(contents, textStatus, jqXHR) {
			// Present it
			$("#main").html(converter.makeHtml(contents));
			upgradeTables("#main");
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			$("#main").html(
				"<h1>" + jqXHR.status + " - " + errorThrown + "</h1>" +
				"<p class='lead'>Go " + 
					"<a href='javascript:history.back();void(0);'>back</a>" +
					" or go " +
					"<a href='?p=Home'>home</a>." +
				"</p>"
			);
		})
		.always(function() {
			$("#main").removeClass("loading");
		});
	}

	$(window).on("hashchange", loadPage);
	loadPage();

})(jQuery, showdown);
