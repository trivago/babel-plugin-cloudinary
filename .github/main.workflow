workflow "Build & Test" {
  on = "push"
  resolves = ["test"]
}

action "build" {
  uses = "docker://node:8"
  args = "npm install"
}

action "test" {
  uses = "docker://node:8"
  needs = ["build"]
  args = "npm run check"
}
