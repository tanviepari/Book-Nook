const findBookBtn = document.getElementById("findBookBtn");
const target = document.getElementById("preference");
const recommendBtn = document.getElementById("recommendBtn")
const loaderContainer = document.querySelector(".loaderContainer");
const results = document.querySelector(".results");

findBookBtn.addEventListener("click", () => {
  slowScrollTo(target, 1200);
});

function slowScrollTo(element, duration) {
  const targetPosition = element.getBoundingClientRect().top + window.pageYOffset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime = null;

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);

    const ease = progress < 0.5
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
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
});

cards.forEach(card => observer.observe(card));

const genrePills = document.querySelectorAll(".genre");
genrePills.forEach(pill => {
    pill.addEventListener("click", () => {
      genrePills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
    });
  });


const readingStylePills = document.querySelectorAll(".readingStyle");
readingStylePills.forEach(pill => {
    pill.addEventListener("click", () => {
      readingStylePills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
    });
  });

const authorTypePills = document.querySelectorAll(".authorType");
authorTypePills.forEach(pill => {
    pill.addEventListener("click", () => {
      authorTypePills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
    });
  });

const preferenceMessage = document.getElementById("preferenceMessage");

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
    
    let genreChoice=document.querySelector(".genre.active");
    let readingStyleChoice=document.querySelector(".readingStyle.active");
    let authorTypeChoice=document.querySelector(".authorType.active");

    if (!genreChoice || !readingStyleChoice || !authorTypeChoice) {
    loaderContainer.classList.add("hidden");
    preferenceMessage.textContent = "Please select all options 📚";
    preferenceMessage.classList.remove("hidden");
    return;
    }

    const books = await fetchBooks(`${genreChoice.innerText} ${readingStyleChoice.innerText} ${authorTypeChoice.innerText}`);
    loaderContainer.classList.add("hidden");
    results.classList.remove("hidden");

    renderResults(books);

  } catch (error) {
    loaderContainer.classList.add("hidden");
    preferenceMessage.textContent = "Something went wrong 😢";
    preferenceMessage.classList.remove("hidden");
    console.error(error);
  }
});


async function fetchBooks(query) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&orderBy=newest&maxResults=3`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.items) return [];

  return data.items.map(item => {
    const info = item.volumeInfo;

    return {
      title: info.title || "Unknown title",
      author: info.authors?.[0] || "Unknown author",
      description: info.description || "No description available.",
      genres: info.categories || [],
      rating: info.averageRating || "N/A",
      coverUrl: info.imageLinks?.thumbnail || ""
    };
  });
}


function createBookCard(book) {
  const card = document.createElement("div");
  card.className = "book-card";

  card.innerHTML = `
    <img class="book-cover" 
         src="${book.coverUrl}" 
         alt="${book.title}" />

    <div class="book-info">
      <h3 class="book-title">${book.title}</h3>
      <p class="book-author">Author:${book.author}</p>
      <p class="book-description">${shorten(book.description)}</p>

      <div class="book-genres">
        Genres : ${book.genres.map(g => `<span>${g}</span>`).join("")}
      </div>

      <span class="book-rating">⭐ ${book.rating}</span>
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

  books.forEach(book => {
    results.appendChild(createBookCard(book));
  });
}

function shorten(text, max = 160) {
  if (text.length <= max) return text;
  return text.slice(0, max) + "…";
}




