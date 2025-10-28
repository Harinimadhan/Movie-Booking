const movies = [
  { id: 1, title: "The Silent Tide", desc: "A coastal mystery. 2h 5m", price: 220 },
  { id: 2, title: "Spacebound", desc: "Sci-fi adventure. 2h 20m", price: 320 },
  { id: 3, title: "Romance in Autumn", desc: "Drama/romance. 1h 50m", price: 180 },
  { id: 4, title: "Action Strike", desc: "High-octane action. 2h", price: 280 }
];

const showtimes = ["10:00 AM", "1:30 PM", "4:45 PM", "8:00 PM"];

let state = {
  user: null,
  selectedMovie: null,
  selectedShowtime: null,
  ticketCount: 1,
  selectedSeats: []
};

const loginView = document.getElementById('loginView');
const moviesView = document.getElementById('moviesView');
const bookingView = document.getElementById('bookingView');
const seatsView = document.getElementById('seatsView');
const paymentView = document.getElementById('paymentView');

const userStatus = document.getElementById('userStatus');
const moviesGrid = document.getElementById('moviesGrid');
const selectedMovieTitle = document.getElementById('selectedMovieTitle');
const movieDesc = document.getElementById('movieDesc');
const showtimesDiv = document.getElementById('showtimes');
const ticketCountSelect = document.getElementById('ticketCount');
const seatGrid = document.getElementById('seatGrid');
const selectedSeatsText = document.getElementById('selectedSeatsText');
const totalPriceSpan = document.getElementById('totalPrice');
const bookingSummary = document.getElementById('bookingSummary');

// Navigation buttons
document.getElementById("navLogin").onclick = () => {
  showView("loginView");
};
document.getElementById("navMovies").onclick = () => {
  showView("moviesView");
};
document.getElementById("navBook").onclick = () => {
  showView("bookingView");
};

// Helper function
function showView(viewId) {
  const views = ["loginView", "moviesView", "bookingView", "seatsView", "paymentView"];
  views.forEach(id => document.getElementById(id).style.display = "none");
  document.getElementById(viewId).style.display = "block";
}


function show(view) {
  [loginView, moviesView, bookingView, seatsView, paymentView].forEach(v => v.style.display = 'none');
  view.style.display = 'block';
}

function updateUserUI() {
  userStatus.innerHTML = state.user ? `Logged in as <strong>${state.user}</strong>` : `<em>Guest</em>`;
}

// LOGIN
document.getElementById('loginBtn').addEventListener('click', () => {
  const email = document.getElementById('email').value.trim();
  if (!email) { alert('Please enter an email'); return; }
  state.user = email;
  updateUserUI();
  renderMovies();
  show(moviesView);
});

document.getElementById('skipBtn').addEventListener('click', () => {
  state.user = null;
  updateUserUI();
  renderMovies();
  show(moviesView);
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  state.user = null;
  updateUserUI();
  show(loginView);
});

// MOVIES
function renderMovies() {
  moviesGrid.innerHTML = '';
  movies.forEach(m => {
    const node = document.createElement('div');
    node.className = 'card movie';
    node.innerHTML = `
      <div class="poster">${m.title.split(' ').slice(0, 2).map(s => s[0]).join('')}</div>
      <div style="flex:1">
        <h3>${m.title}</h3>
        <p>${m.desc}</p>
        <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
          <div style="font-weight:700">₹${m.price}</div>
          <button class="btn" data-id="${m.id}">Book</button>
        </div>
      </div>`;
    moviesGrid.appendChild(node);
  });

  moviesGrid.querySelectorAll('button[data-id]').forEach(b => {
    b.addEventListener('click', e => beginBooking(Number(e.currentTarget.dataset.id)));
  });
}

// BOOKING
function beginBooking(movieId) {
  const m = movies.find(x => x.id === movieId);
  state.selectedMovie = m;
  state.selectedShowtime = null;
  state.ticketCount = 1;

  selectedMovieTitle.textContent = `Booking — ${m.title}`;
  movieDesc.textContent = m.desc + ' — price per ticket: ₹' + m.price;

  showtimesDiv.innerHTML = '';
  showtimes.forEach(st => {
    const el = document.createElement('button');
    el.className = 'chip';
    el.textContent = st;
    el.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      el.classList.add('active');
      state.selectedShowtime = st;
    });
    showtimesDiv.appendChild(el);
  });

  ticketCountSelect.value = '1';
  show(bookingView);
}

document.getElementById('backToMovies').addEventListener('click', () => show(moviesView));
ticketCountSelect.addEventListener('change', e => state.ticketCount = Number(e.target.value));

document.getElementById('chooseSeatsBtn').addEventListener('click', () => {
  if (!state.selectedShowtime) { alert('Please choose a showtime.'); return; }
  state.ticketCount = Number(ticketCountSelect.value);
  state.selectedSeats = [];
  renderSeats();
  updateSeatSummary();
  show(seatsView);
});

document.getElementById('backToBooking').addEventListener('click', () => show(bookingView));

// SEATS
function renderSeats() {
  seatGrid.innerHTML = '';
  const totalSeats = 40;
  const occupied = new Set([2, 3, 7, 11, 16, 19, 22, 29]);
  for (let i = 0; i < totalSeats; i++) {
    const s = document.createElement('div');
    s.className = 'seat' + (occupied.has(i) ? ' occupied' : '');
    s.textContent = i + 1;
    if (!occupied.has(i)) s.addEventListener('click', () => toggleSeat(i, s));
    seatGrid.appendChild(s);
  }
}

function toggleSeat(index, el) {
  const already = state.selectedSeats.indexOf(index);
  if (already >= 0) {
    state.selectedSeats.splice(already, 1);
    el.classList.remove('selected');
  } else {
    if (state.selectedSeats.length >= state.ticketCount) {
      alert('You already selected the max number of seats.');
      return;
    }
    state.selectedSeats.push(index);
    el.classList.add('selected');
  }
  updateSeatSummary();
}

function updateSeatSummary() {
  selectedSeatsText.textContent = `${state.selectedSeats.length} / ${state.ticketCount}`;
  totalPriceSpan.textContent = (state.selectedSeats.length * (state.selectedMovie?.price || 0)).toFixed(0);
}

document.getElementById('confirmSeatsBtn').addEventListener('click', () => {
  if (state.selectedSeats.length !== state.ticketCount) {
    alert(`Select exactly ${state.ticketCount} seats.`);
    return;
  }
  bookingSummary.innerHTML = `
    <p><strong>Movie:</strong> ${state.selectedMovie.title}</p>
    <p><strong>Showtime:</strong> ${state.selectedShowtime}</p>
    <p><strong>Seats:</strong> ${state.selectedSeats.map(s => s + 1).join(', ')}</p>
    <p><strong>Tickets:</strong> ${state.ticketCount}</p>
    <p><strong>Total:</strong> ₹${(state.ticketCount * state.selectedMovie.price)}</p>
    <p><small>Booked by: ${state.user || 'Guest'}</small></p>`;
  show(paymentView);
});

document.getElementById('finalizeBtn').addEventListener('click', () => {
  alert('Payment simulated — booking complete!');
  resetToHome();
});

document.getElementById('homeBtn').addEventListener('click', resetToHome);

function resetToHome() {
  state.selectedMovie = null;
  state.selectedShowtime = null;
  state.selectedSeats = [];
  renderMovies();
  show(moviesView);
}

// INIT
updateUserUI();
show(loginView);
