//When the document is ready, we set up event listeners for the search button and the search text input.
//Any button with this listener will trigger the doSearch function when clicked.
$('#searchButton').click(function () {
    doSearch();
});

//This is an alternative to the search button. If the user presses enter in the search box,
//then the doSearch function will also be triggered.
$('#searchText').keyup(function (e) {
    const ENTER_KEY_CODE = 13;
    if (e.keyCode === ENTER_KEY_CODE) {
        doSearch();
    }
});

//This is the function that does all the hard work
//of searching, parsing, and formatting the search results.
function doSearch() {
    //This grabs the text the user wrote in the search box
    //It also trims any extra whitespace at the beginning or the end
    //of the search query.
    const searchVal = $('#searchText').val().trim();

    //If the query is empty return and do not make a call.
    if (searchVal.length === 0) {
        return;
    }

    //This is the AJAX call to the API. It sends the search query and gets back the results.
    $.ajax({
        //This is the URL of the API Serper.
        url: 'https://google.serper.dev/search',

        type: 'GET', //Apparently, this is good practice to include. It is the request type.

        //This is the data that gets appended to the search query.
        data: {
            q: encodeURIComponent(searchVal), //This is the search query itself, properly encoded for a URL.
            apiKey: '9a2f3558cdbf0e90fa4dda9e95bf677beae1d7a4', //This is the API key
            format: 'json', //This tells the API we want the results in JSON format.
            origin: '*' //This allows the API to be called from any domain (CORS policy).
        },
        dataType: 'json' //This tells jQuery to expect a JSON response and automatically parse it into a JavaScript object.
    })
    .done(function (data) {

        //The resultsContainer is the div where we will put all the search results. We first clear it out.
        const resultsContainer = $('#searchResults');
        resultsContainer.empty();

        //This updates the header above the search results to show what the user searched for.
        $('#searchResultsHeader').text(`Results for "${$('#searchText').val().trim()}":`);

        //Knowledge Graph
        if (data.knowledgeGraph) {

            //Creates a variable that holds the knowledge graph data.
            const kg = data.knowledgeGraph;

            //Creates a new html div element in memory.
            const kgDiv = $('<div>').addClass('knowledge-graph');

            // Create a wrapper for the text content so it stays together on the left
            const textWrapper = $('<div>').addClass('kg-text-wrapper');
            const title = $('<h3>').text(kg.title || '');
            const description = $('<p>').text(kg.description || '');
            textWrapper.append(title, description);

            kgDiv.append(textWrapper);

            if (kg.imageUrl) {
                const img = $('<img>')
                    .attr('src', kg.imageUrl)
                    .addClass('knowledge-graph-image-class');
                kgDiv.append(img); // Appending after textWrapper puts it on the right
            }

            resultsContainer.append(kgDiv);
        }

        //The links
        if (data.organic && data.organic.length > 0) {

            data.organic.forEach(result => {

                //Create a new div for this search result
                const resultDiv = $('<div>')
                    .addClass('ui-widget-content organic-results');

                //This is the websites domain that appears above the link.
                const domain = new URL(result.link)
                    .hostname.replace('www.', '');
                const domainText = $('<small>').text(domain);

                //This is the clickable link that takes you to the website.
                const link = $('<a>')
                    .attr('href', result.link)
                    .attr('target', '_blank')
                    .attr('rel', 'noopener noreferrer');

                //This is the title of the search result that appears as the clickable text of the link.
                const title = $('<strong>')
                    .text(result.title || '');

                //We append that title to the link, so the title becomes the clickable part of the search result.
                link.append(title);

                //This is the snippet of text that appears below the link, giving a preview of the content on the website.
                const snippet = $('<span>')
                    .text(result.snippet || '');

                //Now we append the domain, the link (with the title), and the snippet to our result div.
                resultDiv.append(domainText);
                resultDiv.append('<br>');
                resultDiv.append(link);
                resultDiv.append('<br>');
                resultDiv.append(snippet);

                //Finally, we append this entire search result div to our results container, and add a line break after it.
                resultsContainer.append(resultDiv);
                resultsContainer.append($('<br>'));
            });
        }

        //People also asked
        if (data.peopleAlsoAsk && data.peopleAlsoAsk.length > 0) {

            //Create a new div for the "People Also Ask" section
            const paaDiv = $('<div>')
                .addClass('ui-widget-content people-also-ask');
            paaDiv.append($('<h4>').text('People Also Ask'));

            data.peopleAlsoAsk.forEach(item => {

                //This is the question that people also ask related to the search query.
                const question = $('<strong>')
                    .text(item.question || '');

                //This is the snippet of text that appears below the question, giving a preview of the answer to that question.
                const snippet = $('<small>')
                    .text(item.snippet || '');

                //Now we create a new paragraph element and append the question and snippet to it.
                const p = $('<p>');
                p.append(question);
                p.append('<br>');
                p.append(snippet);

                //Now we append this question and snippet to our "People Also Ask" div.
                paaDiv.append(p);
            });

            //Finally, we append the entire "People Also Ask" div to our results container.
            resultsContainer.append(paaDiv);
        }

        //Related searches
        if (data.relatedSearches && data.relatedSearches.length > 0) {

            //Create a new div for the "Related Searches" section
            const relatedDiv = $('<div>')
                .addClass('ui-widget-content related-searches');
            relatedDiv.append($('<h4>').text('Related Searches'));

            //For each related search, we create a button that the user can click to perform that search.
            data.relatedSearches.forEach(item => {

                //This is the button for the related search. When clicked, it sets the search box value 
                //to the related search query and triggers a new search.
                const button = $('<button>')
                    .addClass('related-search-button')
                    .text(item.query)
                    .on('click', function () {
                        $('#searchText').val(item.query);
                        doSearch();
                    });

                //We append this button to our "Related Searches" div.
                relatedDiv.append(button);
            });

            //Finally, we append the entire "Related Searches" div to our results container.
            resultsContainer.append(relatedDiv);
        }
    });
}