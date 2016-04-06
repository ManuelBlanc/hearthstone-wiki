(function($, showdown) {
	"use strict";

	var GIT_USER  = "ManuelBlanc";
	var REPO_NAME = "hearthstone-wiki";
	var TITLE_SUFFIX = " : Wiki Guias";

	var USER_REPO     = GIT_USER + "/" + REPO_NAME;
	var WIKI_URL      = "https://github.com/" + USER_REPO + "/wiki/";
	var WIKI_RAW_URL  = "https://raw.githubusercontent.com/wiki/" + USER_REPO + "/";

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
		var url_on_wiki = WIKI_URL + slug
		$("a.ribbon").attr("href", url_on_wiki);
		$("a.edit-button").attr("href", url_on_wiki + "/_edit");
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

	var main = $("#main");
	function showTab(tabname) {
		// Has the tabs: loading, error, content
		main.children().hide();
		main.children("." + tabname).show();
	}

	// Clear the "no-javascript" message
	showTab("loading");

	function loadPage() {

		var slug = getSlugFromURL();

		if (slug === null) {
			history.replaceState(null, "", "?p=Home");
			slug = "Home";
		}

		setLocation(slug);
		showTab("loading");

		// Make the request
		$.ajax({
			dataType: "text",
			url: WIKI_RAW_URL + slug + ".md"
		})
		.done(function(contents, textStatus, jqXHR) {
			// Present it
			showTab("content");
			main.find(".content-body").html(converter.makeHtml(contents));
			main.find(".content-title").text(slug.replace(/-/g, " "));
			upgradeTables("#main .content-body");
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			showTab("error");
			main.find(".error h1").text(jqXHR.status + " - " + errorThrown);
		});
	}

	$(window).on("hashchange", loadPage);
	loadPage();

})(jQuery, showdown);
