<h3><b>Sharingan</b></h3>

# 📖 Sharingan <a name="about-project"></a>

> This knowledge based system has been created to help code reviewers quickly search for specific code review guidelines
> and generate a ready to use comment
> for each requirement that is not followed by the student.
> The Admin can manage data and have analytics that display what users were searching for.

![showcase](https://user-images.githubusercontent.com/26736582/232632881-aadfed3a-e105-4e13-b0e7-b858e4eb2099.png)


## 🛠 Built With <a name="built-with"></a>

### Tech Stack <a name="tech-stack"></a>

This project was built using.
<details>
  <summary>Client</summary>
  <ul>
    <li><a href="https://tailwindcss.com/">tailwind</a></li>
    <li><a href=https://www.w3schools.com/html/">HTML</a></li>
    <li><a href="https://developer.mozilla.org/en-US/docs/Web/CSS">CSS</a></li>
    <li><a href="https://stimulus.hotwired.dev/handbook/introduction">Stimulus</a></li>
  </ul>
</details>

<details>
  <summary>Server</summary>
  <ul>
    <li><a href="https://rubyonrails.org/">Ruby on Rails</a></li>
  </ul>
</details>

<details>
<summary>Database</summary>
  <ul>
    <li><a href="https://www.postgresql.org/">PostgreSQL</a></li>
  </ul>
</details>

<details>
<summary> Other Technologies </summary>
  <ul>
    <li><a href="https://github.com/sidekiq/sidekiq">Sidekiq</a></li>
    <li><a href="https://github.com/redis/redis">Redis</a></li>
  </ul>
</details>

<!-- Features -->

### Key Features <a name="key-features"></a>

- **User can register and login**
- **Authenticated User can use realtime search box to search guidelines and generate ready to use comment for
  each uncompleted requirements based on the company standard**
- **Admin can manage data and view analytics that display what users were searching for**

[//]: # (make the search box more efficient and handle thousands of requests per hour)

<!-- LIVE DEMO -->

## 🚀 Live Demo <a name="live-demo"></a>

- [Live Demo Link](https://sharingan.up.railway.app/)

## 🚀 Credentials <a name="live-demo"></a>
- Credentials Admin: email: 'admin@test.com', password: 'admin@test'
- Credentials Normal User: email: 'user@test.com', password: 'user@test'

<!-- ## 🚀 Video <a name="live-demo"></a> -->

<!-- - [Video Presentation](https://www.loom.com/share/7af84a32634b45a0b6b45efb63743b69) -->



<!-- GETTING STARTED -->

## 💻 Getting Started <a name="getting-started"></a>

To get a local copy up and running, follow these steps.

### Prerequisites

In order to run this project you need:

- Ruby 3.1 installed
- Rails 7.0.4.3 installed
- Redis server 7.0.10 installed and running 
- PostgreSQL installed
- Git installed [ In case you want to clone this repo using your terminal]
- Any IDE or text editor that supports Ruby

### Setup

Clone this repository to your desired folder:

#### 1. Clone this repository or download the Zip folder:"

```bash command
$ git clone git@github.com:bienvenuushindi/sharingan.git
```

#### 2. Navigate to the location of the folder in your machine:

```bash command
you@your-Pc-name:~$ cd <folder>
```

#### 3. Press Enter to navigate to your local clone.

#### 4. Install the gems and dependencies:

```bash command
bundle install
npm install
```

#### 5. Create database and run the necessary migration files & build js bundles :

```bash command
$ bin/rails db:create
$ rake db:migrate
$ rake db:seed
$ yarn run build
```

#### 6. Run Sidekiq for background processing :

```bash command
$  bundle exec sidekiq 
```

#### 7 Finally you can run the server:

```bash command
rails s
```

#### Additionally, run this if you want to test the app:

> Note: Make sure your server is running in test mode. You can run the following command to enter the test mode
```bash command
rails s -e test
```
Finally you can run this command to test the solution
```bash command
bundle exec rspec spec
```


<!-- AUTHOR -->

## 👥 Authors <a name="authors"></a>

👤 **Ushindi Bienvenu**

- GitHub: [@usbbush](https://github.com/bienvenuushindi)
- LinkedIn: [@usbbush](https://www.linkedin.com/in/usbbush/)
- Twitter: [@usbbush](https://www.twitter.com/usbbush/)



<!-- FUTURE FEATURES -->

## 🔭 Future Features <a name="future-features"></a>

- [ ] **Improve design and Improve navigation**
- [ ] **Add more statistics data to give more insights to the Admin**
- [ ] **Improve Search Algorithm**



<!-- CONTRIBUTING -->

## 🤝 Contributing <a name="contributing"></a>

Contributions, issues, and feature requests are welcome!

Feel free to check the [issues page](../../issues/).



<!-- SUPPORT -->

## ⭐️ Show your support <a name="support"></a>

If you like this project, Kindly give it a ⭐



<!-- ACKNOWLEDGEMENTS -->

## 🙏 Acknowledgments <a name="acknowledgements"></a>

I would like to thank the Ruby community



<!-- LICENSE -->

## 📝 License <a name="license"></a>

This project is [MIT](./LICENSE) licensed.

_NOTE: we recommend using the [MIT license](https://choosealicense.com/licenses/mit/) - you can set it up quickly
by [using templates available on GitHub](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/adding-a-license-to-a-repository).
You can also use [any other license](https://choosealicense.com/licenses/) if you wish._


