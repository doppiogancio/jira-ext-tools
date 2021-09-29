chrome.runtime.onMessage.addListener(function(request, sender) {
    if (request.action === "getSource") {
        let extractor = new IssueExtractor(request);
        let issue = extractor.extract();

        jQuery('#firstCommitMessage').val(issue.getFirstCommitMessage());
        jQuery('#branchName').val(issue.getBranchName());
    }
});

class IssueExtractor {
    constructor(request) {
        this.page = jQuery(request.source);
    }

    extract() {
        let number = this._issueNumber();
        let title = this._issueTitle();

        return new Issue(number, title);
    }

    _issueNumber() {
        return jQuery('[aria-label="Breadcrumbs"] ol > *:last-child > li > a > span', this.page).html();
    }

    _issueTitle() {
        return jQuery('[data-test-id="issue.views.issue-base.foundation.summary.heading"]', this.page)
            .html()
            .replace(/&amp;/g, "&");
    }
}

class Issue {
    constructor(number, title) {
        this._number = number;
        this._title = title;
    }

    getNumber() {
        return this._number;
    }

    getTitle() {
        return this._title;
    }

    getFirstCommitMessage() {
        return this.getNumber() + ' - ' + this.getTitle();
    }

    getBranchName() {
        return this._sanitize(this.getFirstCommitMessage())
            .substring(0, 20);
    }

    _sanitize(stringToSanitize) {
        return stringToSanitize.replace(" - JIRA", "")
            .replace(/'/g, "")
            .replace(/&/g, "and")
            .replace(/\[/g, "")
            .replace(/\]/g, "")
            .replace(/:/g, "")
            .replace(/"/g, "")
            .replace(/ /g, "-")
            .replace(/---/g, "-")
            .replace(/\//g, "-")
            .toLowerCase()
            .replace("pm", "PM");
    }
}

function onWindowLoad() {

    chrome.tabs.executeScript(null, {
        file: "getPagesSource.js"
    }, function() {
        // If you try and inject into an extensions page or the webstore/NTP you'll get an error
        if (chrome.runtime.lastError) {
            jQuery('#alert').html('<strong>Error: </strong>' + chrome.runtime.lastError.message)
                .show();
        }
    });

}

window.onload = onWindowLoad;