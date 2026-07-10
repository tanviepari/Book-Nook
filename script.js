const findBookBtn = document.getElementById("findBookBtn");
const target = document.getElementById("preference");
const recommendBtn = document.getElementById("recommendBtn");
const loaderContainer = document.querySelector(".loaderContainer");
const results = document.querySelector(".results");

findBookBtn.addEventListener("click", () => {
  slowScrollTo(target, 1200);
});

function slowScrollTo(element, duration) {
  const targetPosition =
    element.getBoundingClientRect().top + window.pageYOffset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime = null;

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);

    const ease =
      progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    window.scrollTo(0, startPosition + distance * ease);

    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  }

  requestAnimationFrame(animation);
}

const cards = document.querySelectorAll(".choiceCard");
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
});

cards.forEach((card) => observer.observe(card));

const genrePills = document.querySelectorAll(".genre");
genrePills.forEach((pill) => {
  pill.addEventListener("click", () => {
    genrePills.forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");
  });
});

const readingStylePills = document.querySelectorAll(".readingStyle");
readingStylePills.forEach((pill) => {
  pill.addEventListener("click", () => {
    readingStylePills.forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");
  });
});

const authorTypePills = document.querySelectorAll(".authorType");
authorTypePills.forEach((pill) => {
  pill.addEventListener("click", () => {
    authorTypePills.forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");
  });
});

const preferenceMessage = document.getElementById("preferenceMessage");

const recommendationMap = {

  Fantasy: {
    "Cozy": "fantasy",
    "Dark": "dark_fantasy",
    "Emotional": "mythology",
    "Adventurous": "epic_fantasy",
    "Light and Fun": "magic"
  },

  Mystery: {
    "Cozy": "mystery_and_detective_stories",
    "Dark": "crime",
    "Emotional": "psychological_fiction",
    "Adventurous": "mystery_and_detective_stories",
    "Light and Fun": "mystery"
  },

  Romance: {
    "Cozy": "romance",
    "Dark": "gothic_fiction",
    "Emotional": "love",
    "Adventurous": "historical_fiction",
    "Light and Fun": "humor"
  },

  Thriller: {
    "Cozy": "thriller",
    "Dark": "psychological_fiction",
    "Emotional": "crime",
    "Adventurous": "adventure",
    "Light and Fun": "thriller"
  },

  "Young adult": {
    "Cozy": "young_adult",
    "Dark": "young_adult",
    "Emotional": "coming_of_age",
    "Adventurous": "young_adult",
    "Light and Fun": "young_adult"
  },

  Classics: {
    "Cozy": "literature",
    "Dark": "gothic_fiction",
    "Emotional": "literature",
    "Adventurous": "adventure",
    "Light and Fun": "humor"
  }

};

recommendBtn.addEventListener("click", async () => {
  document
    .querySelector(".recommendationArea")
    .scrollIntoView({ behavior: "smooth", block: "start" });

  results.innerHTML = "";
  results.classList.add("hidden");
  loaderContainer.classList.remove("hidden");

  try {
    preferenceMessage.classList.add("hidden");
    preferenceMessage.textContent = "";
    loaderContainer.classList.remove("hidden");

    let genreChoice = document.querySelector(".genre.active");
    let readingStyleChoice = document.querySelector(".readingStyle.active");
    let authorTypeChoice = document.querySelector(".authorType.active");

    if (!genreChoice || !readingStyleChoice || !authorTypeChoice) {
      loaderContainer.classList.add("hidden");
      preferenceMessage.textContent = "Please select all options";
      preferenceMessage.classList.remove("hidden");
      return;
    }

    const books = await fetchBooks(
      genreChoice.innerText,
      readingStyleChoice.innerText,
      authorTypeChoice.innerText,
    );
    loaderContainer.classList.add("hidden");
    results.classList.remove("hidden");

    renderResults(books);
  } catch (error) {
    loaderContainer.classList.add("hidden");
    preferenceMessage.textContent = "Something went wrong ";
    preferenceMessage.classList.remove("hidden");
    console.error(error);
  }
});

async function fetchBooks(genre, style, authorType) {
  const subject =
    recommendationMap[genre][style];

  const response = await fetch(
    `https://openlibrary.org/subjects/${subject}.json?limit=30`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch books.");
  }

  const data = await response.json();

  let books = data.works || [];

  // ---------- Author Type Filter ----------

  switch(authorType){

    case "Classic":
        books = books.filter(book =>
            book.first_publish_year &&
            book.first_publish_year <= 1985
        );
        break;

    case "Modern":
        books = books.filter(book =>
            book.first_publish_year &&
            book.first_publish_year >= 1995
        );
        break;

    case "Popular":
        books.sort((a,b)=>
            (b.edition_count||0)-(a.edition_count||0)
        );
        break;

    case "Any":
        break;

}


  // ---------- Fetch descriptions ----------

  const recommendations = await Promise.all(
    books
      .filter((book) => book.cover_id)
      .slice(0, 3)
      .map(async (book) => {
        let description = "No description available.";

        try {
          const workResponse = await fetch(
            `https://openlibrary.org${book.key}.json`,
          );

          const work = await workResponse.json();

          if (typeof work.description === "string") {
            description = work.description;
          } else if (work.description?.value) {
            description = work.description.value;
          }
        } catch (err) {}

        return {
          title: book.title,

          author: book.authors?.[0]?.name || "Unknown Author",

          description,

          genres: (book.subject || []).slice(0, 3),

          published: book.first_publish_year || "Unknown",

          coverUrl: `https://covers.openlibrary.org/b/id/${book.cover_id}-L.jpg`,
        };
      }),
  );

  return recommendations;
}

function createBookCard(book) {
  const card = document.createElement("div");
  card.className = "book-card";

  card.innerHTML = `
    <img
      class="book-cover"
      src="${book.coverUrl}"
      alt="${book.title}"
      onerror="this.src='https://placehold.co/150x220?text=No+Cover'"
    />

    <div class="book-info">
      <h3 class="book-title">${book.title}</h3>

      <p class="book-author">
        <strong>Author:</strong> ${book.author}
      </p>

      <p class="book-year">
        First Published: ${book.published}
      </p>

      <p class="book-description">
        ${shorten(book.description)}
      </p>

      <div class="book-genres">
        ${book.genres.map((g) => `<span>${g}</span>`).join("")}
      </div>

    </div>
`;

  return card;
}

function renderResults(books) {
  results.innerHTML = "";

  if (books.length === 0) {
    results.innerHTML = "<p>No books found 😔</p>";
    return;
  }

  books.forEach((book) => {
    results.appendChild(createBookCard(book));
  });
}

function shorten(text, max = 160) {
  if (!text) return "No description available.";
  if (text.length <= max) return text;
  return text.slice(0, max) + "…";
}
