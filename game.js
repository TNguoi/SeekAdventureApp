export class Game {
  users = [];
  reveal = false;
  constructor() {}

  addUser(userId) {
    this.users.push({ userId: userId, username: 'New User', vote: 0 });
  }

  removeUser(userId) {
    this.users = this.users.filter((e) => {
      e.userId !== userId;
    });
  }

  setUsername(userId, username) {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].userId === userId) {
        this.users[i].username = username;
      }
    }
  }

  setReveal(reveal) {
    this.reveal = reveal;
  }

  setUserVote(userId, vote) {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].userId === userId) {
        this.users[i].vote = vote;
      }
    }
  }

  resetVote() {
    for (let i = 0; i < this.users.length; i++) {
      this.users[i].vote = 0;
    }
    this.reveal = false;
  }

  data() {
    return JSON.stringify({ users: this.users, reveal: this.reveal });
  }
}
