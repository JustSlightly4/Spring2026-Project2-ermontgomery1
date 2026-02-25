$('#searchButton').click(function () {
    doSearch();
});

$('#searchText').keyup(function (e) {
    const ENTER_KEY_CODE = 13;
    if (e.keyCode === ENTER_KEY_CODE) {
        doSearch();
    }
});

function doSearch() {
    const searchVal = $('#searchText').val();
    $.ajax({
        url: 'https://google.serper.dev/search?q=' + encodeURIComponent(searchVal) + '&apiKey=9a2f3558cdbf0e90fa4dda9e95bf677beae1d7a4',
        data: {
            format: 'json',
            origin: '*'
        },
        dataType: 'json'
    })
    .done(function (data) {
        $('#searchResultsHeader').html(`Results for "${searchVal}":`);
        let results = '';
        let kgHtml = '';

        // 1. Handle Knowledge Graph (The Sidebar Info)
        if (data.knowledgeGraph) {
            const kg = data.knowledgeGraph;
            kgHtml = `
        <div class="ui-widget-header" style="border: 1px solid #ddd; padding: 15px; margin-bottom: 20px;">
            <h3>${kg.title || ''}</h3>
            <small>${kg.type || ''}</small><br />
            ${kg.imageUrl ? `<img src="${kg.imageUrl}" style="width:100px; float:right;" />` : ''}
            <p>${kg.description || ''}</p>
            ${kg.descriptionLink ? `<a href="${kg.descriptionLink}" target="_blank">Source</a>` : ''}
            <div style="clear:both;"></div>
        </div>
    `;
        }

        // 2. Handle Organic Results (The usual links)
        if (data.organic && data.organic.length > 0) {
            data.organic.forEach(function (result) {
                results += `
            <div class="ui-widget-content">
                <a href="${result.link}" target="_blank">
                    <strong>${result.title}</strong>
                </a><br />
                <span>${result.snippet}</span><br /><br />
            </div>
        `;
            });
        }

        // Combine them: Knowledge Graph first, then Organic Results
        $('#searchResults').html(kgHtml + results);
        })
        .fail(function () {
            alert('Could not get data');
        });
}