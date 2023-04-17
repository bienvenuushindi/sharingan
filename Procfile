web: rake db:migrate && yarn run build && bundle exec sidekiq -c 5 && bin/rails server -b 0.0.0.0 -p ${PORT:-3000}
