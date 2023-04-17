web: rake db:migrate && rake db:seed && yarn run build && bin/rails server -b 0.0.0.0 -p ${PORT:-3000}
worker: bundle exec sidekiq -c 5
