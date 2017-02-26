var fetchWithCache = _.memoize(fetchJsonp);


function getRandomQuote() {
    var famousPeople = [
        "Dante Alighieri",
        "Aristotle",
        "Charles Darwin",
        "Albert Einstein",
        "William Shakespeare",
        "Virgil",
        "Martin Luther King, Jr.",
        "Leo Tolstoy",
        "Voltaire",
        "Laozi",
        "George Bernard Shaw",
        "John Lennon",
        "Confucius",
        "Seneca the Younger",
        "Winston Churchill"
    ];

    function generateRandomIndex(length) {
        return Math.floor(length * Math.random());
    }

    var pageName = famousPeople[generateRandomIndex(famousPeople.length)];

    var urlToSectionWithQuotes = "https://en.wikiquote.org/w/api.php?action=parse&page={pageName}&section=1&prop=text&format=json".replace("{pageName}", pageName);

    return fetchWithCache(urlToSectionWithQuotes)
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {

            if (!json.parse) {
                var message = "No 'parse' property in response";
                console.log(json, urlToSectionWithQuotes);
                throw new Error(message, json, urlToSectionWithQuotes);
            }

            return {
                wikiQuotesSectionHtml: json.parse.text["*"],
                title: json.parse.title
            };
        })
        .then(function (content) {
            var $quotes = $("<div>" + content.wikiQuotesSectionHtml + "</div>");

            var shortQuotes = $quotes.find("li b").toArray().reduce(function (memo, boldElement) {
                var text = $(boldElement).text();

                var isEndsWithComma = text.charAt(text.length - 1) == ",";

                // cut off one words findings (requires more intelligent parsing)
                if (text.match(/\s/g) && !isEndsWithComma) {
                    memo.push(text);
                }

                return memo;
            }, []);

            var randomIndex = generateRandomIndex(shortQuotes.length);
            var quote = shortQuotes[randomIndex];

            if (!quote){
                console.log("Problem with quote", randomIndex, shortQuotes);
            }

            return {
                quote: quote,
                title: content.title
            };
        })
        .then(function (quoteToShow) {
            console.log(quoteToShow);
            return quoteToShow;
        })
        .catch(function (err) {
            console.log(err);
        });
}


var quotesMachina = new Vue({

    el : ".js-quotes-machina",

    data: {
        quote: "",
        title: ""
    },

    computed: {
        pageUrl : function () {
            return "https://en.wikiquote.org/wiki/" + this.title;
        }
    },

    created: function () {
        this.nextQuote();
    },

    methods: {

        nextQuote: function () {

            var self = this;

            getRandomQuote().then(function (quoteToShow) {
                self.quote = quoteToShow.quote;
                self.title = quoteToShow.title;
                console.log(self);
            });

        }


    }

});

console.log(Vue);
