.PHONY: dev

dev-fe:
	cd teperunner-main && bun dev

dev-runner:
	cd teperunner-worker && cargo run

redis:
	docker run -d --name redis -p 6379:6379 redis