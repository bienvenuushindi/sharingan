# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.0].define(version: 2023_04_16_160219) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "Searchs", force: :cascade do |t|
    t.string "term", default: "", null: false
    t.integer "occurrence", default: 0, null: false
    t.integer "user_count", default: 0, null: false
    t.integer "article_count", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["term"], name: "index_Searchs_on_term"
  end

  create_table "Searchs_articles", id: false, force: :cascade do |t|
    t.bigint "article_id", null: false
    t.bigint "Search_id", null: false
    t.datetime "created_at", default: "2023-01-19 10:58:22", null: false
    t.index ["Search_id"], name: "index_Searchs_articles_on_Search_id"
    t.index ["article_id"], name: "index_Searchs_articles_on_article_id"
  end

  create_table "Searchs_users", id: false, force: :cascade do |t|
    t.bigint "Search_id", null: false
    t.bigint "user_id", null: false
    t.index ["Search_id"], name: "index_Searchs_users_on_Search_id"
    t.index ["user_id"], name: "index_analytics_users_on_user_id"
  end

  create_table "articles", force: :cascade do |t|
    t.string "title", null: false
    t.text "body", default: "", null: false
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "visited_count", default: 0
    t.boolean "public", default: true
    t.index ["title"], name: "index_articles_on_title"
    t.index ["user_id"], name: "index_articles_on_user_id"
  end

  create_table "articles_categories", id: false, force: :cascade do |t|
    t.bigint "article_id", null: false
    t.bigint "category_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["article_id"], name: "index_articles_categories_on_article_id"
    t.index ["category_id"], name: "index_articles_categories_on_category_id"
  end

  create_table "categories", force: :cascade do |t|
    t.string "name", null: false
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "parent_category_id"
    t.index ["user_id"], name: "index_categories_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "role", default: "user"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "analytics_articles", "analytics"
  add_foreign_key "analytics_articles", "articles"
  add_foreign_key "analytics_users", "analytics"
  add_foreign_key "analytics_users", "users"
  add_foreign_key "articles", "users"
  add_foreign_key "articles_categories", "articles"
  add_foreign_key "articles_categories", "categories"
  add_foreign_key "categories", "users"
end
