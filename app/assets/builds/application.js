(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };

  // node_modules/@rails/actioncable/src/adapters.js
  var adapters_default;
  var init_adapters = __esm({
    "node_modules/@rails/actioncable/src/adapters.js"() {
      adapters_default = {
        logger: self.console,
        WebSocket: self.WebSocket
      };
    }
  });

  // node_modules/@rails/actioncable/src/logger.js
  var logger_default;
  var init_logger = __esm({
    "node_modules/@rails/actioncable/src/logger.js"() {
      init_adapters();
      logger_default = {
        log(...messages) {
          if (this.enabled) {
            messages.push(Date.now());
            adapters_default.logger.log("[ActionCable]", ...messages);
          }
        }
      };
    }
  });

  // node_modules/@rails/actioncable/src/connection_monitor.js
  var now, secondsSince, ConnectionMonitor, connection_monitor_default;
  var init_connection_monitor = __esm({
    "node_modules/@rails/actioncable/src/connection_monitor.js"() {
      init_logger();
      now = () => (/* @__PURE__ */ new Date()).getTime();
      secondsSince = (time) => (now() - time) / 1e3;
      ConnectionMonitor = class {
        constructor(connection) {
          this.visibilityDidChange = this.visibilityDidChange.bind(this);
          this.connection = connection;
          this.reconnectAttempts = 0;
        }
        start() {
          if (!this.isRunning()) {
            this.startedAt = now();
            delete this.stoppedAt;
            this.startPolling();
            addEventListener("visibilitychange", this.visibilityDidChange);
            logger_default.log(`ConnectionMonitor started. stale threshold = ${this.constructor.staleThreshold} s`);
          }
        }
        stop() {
          if (this.isRunning()) {
            this.stoppedAt = now();
            this.stopPolling();
            removeEventListener("visibilitychange", this.visibilityDidChange);
            logger_default.log("ConnectionMonitor stopped");
          }
        }
        isRunning() {
          return this.startedAt && !this.stoppedAt;
        }
        recordPing() {
          this.pingedAt = now();
        }
        recordConnect() {
          this.reconnectAttempts = 0;
          this.recordPing();
          delete this.disconnectedAt;
          logger_default.log("ConnectionMonitor recorded connect");
        }
        recordDisconnect() {
          this.disconnectedAt = now();
          logger_default.log("ConnectionMonitor recorded disconnect");
        }
        // Private
        startPolling() {
          this.stopPolling();
          this.poll();
        }
        stopPolling() {
          clearTimeout(this.pollTimeout);
        }
        poll() {
          this.pollTimeout = setTimeout(
            () => {
              this.reconnectIfStale();
              this.poll();
            },
            this.getPollInterval()
          );
        }
        getPollInterval() {
          const { staleThreshold, reconnectionBackoffRate } = this.constructor;
          const backoff = Math.pow(1 + reconnectionBackoffRate, Math.min(this.reconnectAttempts, 10));
          const jitterMax = this.reconnectAttempts === 0 ? 1 : reconnectionBackoffRate;
          const jitter = jitterMax * Math.random();
          return staleThreshold * 1e3 * backoff * (1 + jitter);
        }
        reconnectIfStale() {
          if (this.connectionIsStale()) {
            logger_default.log(`ConnectionMonitor detected stale connection. reconnectAttempts = ${this.reconnectAttempts}, time stale = ${secondsSince(this.refreshedAt)} s, stale threshold = ${this.constructor.staleThreshold} s`);
            this.reconnectAttempts++;
            if (this.disconnectedRecently()) {
              logger_default.log(`ConnectionMonitor skipping reopening recent disconnect. time disconnected = ${secondsSince(this.disconnectedAt)} s`);
            } else {
              logger_default.log("ConnectionMonitor reopening");
              this.connection.reopen();
            }
          }
        }
        get refreshedAt() {
          return this.pingedAt ? this.pingedAt : this.startedAt;
        }
        connectionIsStale() {
          return secondsSince(this.refreshedAt) > this.constructor.staleThreshold;
        }
        disconnectedRecently() {
          return this.disconnectedAt && secondsSince(this.disconnectedAt) < this.constructor.staleThreshold;
        }
        visibilityDidChange() {
          if (document.visibilityState === "visible") {
            setTimeout(
              () => {
                if (this.connectionIsStale() || !this.connection.isOpen()) {
                  logger_default.log(`ConnectionMonitor reopening stale connection on visibilitychange. visibilityState = ${document.visibilityState}`);
                  this.connection.reopen();
                }
              },
              200
            );
          }
        }
      };
      ConnectionMonitor.staleThreshold = 6;
      ConnectionMonitor.reconnectionBackoffRate = 0.15;
      connection_monitor_default = ConnectionMonitor;
    }
  });

  // node_modules/@rails/actioncable/src/internal.js
  var internal_default;
  var init_internal = __esm({
    "node_modules/@rails/actioncable/src/internal.js"() {
      internal_default = {
        "message_types": {
          "welcome": "welcome",
          "disconnect": "disconnect",
          "ping": "ping",
          "confirmation": "confirm_subscription",
          "rejection": "reject_subscription"
        },
        "disconnect_reasons": {
          "unauthorized": "unauthorized",
          "invalid_request": "invalid_request",
          "server_restart": "server_restart"
        },
        "default_mount_path": "/cable",
        "protocols": [
          "actioncable-v1-json",
          "actioncable-unsupported"
        ]
      };
    }
  });

  // node_modules/@rails/actioncable/src/connection.js
  var message_types, protocols, supportedProtocols, indexOf, Connection, connection_default;
  var init_connection = __esm({
    "node_modules/@rails/actioncable/src/connection.js"() {
      init_adapters();
      init_connection_monitor();
      init_internal();
      init_logger();
      ({ message_types, protocols } = internal_default);
      supportedProtocols = protocols.slice(0, protocols.length - 1);
      indexOf = [].indexOf;
      Connection = class {
        constructor(consumer2) {
          this.open = this.open.bind(this);
          this.consumer = consumer2;
          this.subscriptions = this.consumer.subscriptions;
          this.monitor = new connection_monitor_default(this);
          this.disconnected = true;
        }
        send(data) {
          if (this.isOpen()) {
            this.webSocket.send(JSON.stringify(data));
            return true;
          } else {
            return false;
          }
        }
        open() {
          if (this.isActive()) {
            logger_default.log(`Attempted to open WebSocket, but existing socket is ${this.getState()}`);
            return false;
          } else {
            logger_default.log(`Opening WebSocket, current state is ${this.getState()}, subprotocols: ${protocols}`);
            if (this.webSocket) {
              this.uninstallEventHandlers();
            }
            this.webSocket = new adapters_default.WebSocket(this.consumer.url, protocols);
            this.installEventHandlers();
            this.monitor.start();
            return true;
          }
        }
        close({ allowReconnect } = { allowReconnect: true }) {
          if (!allowReconnect) {
            this.monitor.stop();
          }
          if (this.isOpen()) {
            return this.webSocket.close();
          }
        }
        reopen() {
          logger_default.log(`Reopening WebSocket, current state is ${this.getState()}`);
          if (this.isActive()) {
            try {
              return this.close();
            } catch (error2) {
              logger_default.log("Failed to reopen WebSocket", error2);
            } finally {
              logger_default.log(`Reopening WebSocket in ${this.constructor.reopenDelay}ms`);
              setTimeout(this.open, this.constructor.reopenDelay);
            }
          } else {
            return this.open();
          }
        }
        getProtocol() {
          if (this.webSocket) {
            return this.webSocket.protocol;
          }
        }
        isOpen() {
          return this.isState("open");
        }
        isActive() {
          return this.isState("open", "connecting");
        }
        // Private
        isProtocolSupported() {
          return indexOf.call(supportedProtocols, this.getProtocol()) >= 0;
        }
        isState(...states) {
          return indexOf.call(states, this.getState()) >= 0;
        }
        getState() {
          if (this.webSocket) {
            for (let state in adapters_default.WebSocket) {
              if (adapters_default.WebSocket[state] === this.webSocket.readyState) {
                return state.toLowerCase();
              }
            }
          }
          return null;
        }
        installEventHandlers() {
          for (let eventName in this.events) {
            const handler = this.events[eventName].bind(this);
            this.webSocket[`on${eventName}`] = handler;
          }
        }
        uninstallEventHandlers() {
          for (let eventName in this.events) {
            this.webSocket[`on${eventName}`] = function() {
            };
          }
        }
      };
      Connection.reopenDelay = 500;
      Connection.prototype.events = {
        message(event) {
          if (!this.isProtocolSupported()) {
            return;
          }
          const { identifier, message, reason, reconnect, type } = JSON.parse(event.data);
          switch (type) {
            case message_types.welcome:
              this.monitor.recordConnect();
              return this.subscriptions.reload();
            case message_types.disconnect:
              logger_default.log(`Disconnecting. Reason: ${reason}`);
              return this.close({ allowReconnect: reconnect });
            case message_types.ping:
              return this.monitor.recordPing();
            case message_types.confirmation:
              this.subscriptions.confirmSubscription(identifier);
              return this.subscriptions.notify(identifier, "connected");
            case message_types.rejection:
              return this.subscriptions.reject(identifier);
            default:
              return this.subscriptions.notify(identifier, "received", message);
          }
        },
        open() {
          logger_default.log(`WebSocket onopen event, using '${this.getProtocol()}' subprotocol`);
          this.disconnected = false;
          if (!this.isProtocolSupported()) {
            logger_default.log("Protocol is unsupported. Stopping monitor and disconnecting.");
            return this.close({ allowReconnect: false });
          }
        },
        close(event) {
          logger_default.log("WebSocket onclose event");
          if (this.disconnected) {
            return;
          }
          this.disconnected = true;
          this.monitor.recordDisconnect();
          return this.subscriptions.notifyAll("disconnected", { willAttemptReconnect: this.monitor.isRunning() });
        },
        error() {
          logger_default.log("WebSocket onerror event");
        }
      };
      connection_default = Connection;
    }
  });

  // node_modules/@rails/actioncable/src/subscription.js
  var extend, Subscription;
  var init_subscription = __esm({
    "node_modules/@rails/actioncable/src/subscription.js"() {
      extend = function(object, properties) {
        if (properties != null) {
          for (let key in properties) {
            const value = properties[key];
            object[key] = value;
          }
        }
        return object;
      };
      Subscription = class {
        constructor(consumer2, params = {}, mixin) {
          this.consumer = consumer2;
          this.identifier = JSON.stringify(params);
          extend(this, mixin);
        }
        // Perform a channel action with the optional data passed as an attribute
        perform(action, data = {}) {
          data.action = action;
          return this.send(data);
        }
        send(data) {
          return this.consumer.send({ command: "message", identifier: this.identifier, data: JSON.stringify(data) });
        }
        unsubscribe() {
          return this.consumer.subscriptions.remove(this);
        }
      };
    }
  });

  // node_modules/@rails/actioncable/src/subscription_guarantor.js
  var SubscriptionGuarantor, subscription_guarantor_default;
  var init_subscription_guarantor = __esm({
    "node_modules/@rails/actioncable/src/subscription_guarantor.js"() {
      init_logger();
      SubscriptionGuarantor = class {
        constructor(subscriptions) {
          this.subscriptions = subscriptions;
          this.pendingSubscriptions = [];
        }
        guarantee(subscription) {
          if (this.pendingSubscriptions.indexOf(subscription) == -1) {
            logger_default.log(`SubscriptionGuarantor guaranteeing ${subscription.identifier}`);
            this.pendingSubscriptions.push(subscription);
          } else {
            logger_default.log(`SubscriptionGuarantor already guaranteeing ${subscription.identifier}`);
          }
          this.startGuaranteeing();
        }
        forget(subscription) {
          logger_default.log(`SubscriptionGuarantor forgetting ${subscription.identifier}`);
          this.pendingSubscriptions = this.pendingSubscriptions.filter((s) => s !== subscription);
        }
        startGuaranteeing() {
          this.stopGuaranteeing();
          this.retrySubscribing();
        }
        stopGuaranteeing() {
          clearTimeout(this.retryTimeout);
        }
        retrySubscribing() {
          this.retryTimeout = setTimeout(
            () => {
              if (this.subscriptions && typeof this.subscriptions.subscribe === "function") {
                this.pendingSubscriptions.map((subscription) => {
                  logger_default.log(`SubscriptionGuarantor resubscribing ${subscription.identifier}`);
                  this.subscriptions.subscribe(subscription);
                });
              }
            },
            500
          );
        }
      };
      subscription_guarantor_default = SubscriptionGuarantor;
    }
  });

  // node_modules/@rails/actioncable/src/subscriptions.js
  var Subscriptions;
  var init_subscriptions = __esm({
    "node_modules/@rails/actioncable/src/subscriptions.js"() {
      init_subscription();
      init_subscription_guarantor();
      init_logger();
      Subscriptions = class {
        constructor(consumer2) {
          this.consumer = consumer2;
          this.guarantor = new subscription_guarantor_default(this);
          this.subscriptions = [];
        }
        create(channelName, mixin) {
          const channel = channelName;
          const params = typeof channel === "object" ? channel : { channel };
          const subscription = new Subscription(this.consumer, params, mixin);
          return this.add(subscription);
        }
        // Private
        add(subscription) {
          this.subscriptions.push(subscription);
          this.consumer.ensureActiveConnection();
          this.notify(subscription, "initialized");
          this.subscribe(subscription);
          return subscription;
        }
        remove(subscription) {
          this.forget(subscription);
          if (!this.findAll(subscription.identifier).length) {
            this.sendCommand(subscription, "unsubscribe");
          }
          return subscription;
        }
        reject(identifier) {
          return this.findAll(identifier).map((subscription) => {
            this.forget(subscription);
            this.notify(subscription, "rejected");
            return subscription;
          });
        }
        forget(subscription) {
          this.guarantor.forget(subscription);
          this.subscriptions = this.subscriptions.filter((s) => s !== subscription);
          return subscription;
        }
        findAll(identifier) {
          return this.subscriptions.filter((s) => s.identifier === identifier);
        }
        reload() {
          return this.subscriptions.map((subscription) => this.subscribe(subscription));
        }
        notifyAll(callbackName, ...args) {
          return this.subscriptions.map((subscription) => this.notify(subscription, callbackName, ...args));
        }
        notify(subscription, callbackName, ...args) {
          let subscriptions;
          if (typeof subscription === "string") {
            subscriptions = this.findAll(subscription);
          } else {
            subscriptions = [subscription];
          }
          return subscriptions.map((subscription2) => typeof subscription2[callbackName] === "function" ? subscription2[callbackName](...args) : void 0);
        }
        subscribe(subscription) {
          if (this.sendCommand(subscription, "subscribe")) {
            this.guarantor.guarantee(subscription);
          }
        }
        confirmSubscription(identifier) {
          logger_default.log(`Subscription confirmed ${identifier}`);
          this.findAll(identifier).map((subscription) => this.guarantor.forget(subscription));
        }
        sendCommand(subscription, command) {
          const { identifier } = subscription;
          return this.consumer.send({ command, identifier });
        }
      };
    }
  });

  // node_modules/@rails/actioncable/src/consumer.js
  function createWebSocketURL(url) {
    if (typeof url === "function") {
      url = url();
    }
    if (url && !/^wss?:/i.test(url)) {
      const a = document.createElement("a");
      a.href = url;
      a.href = a.href;
      a.protocol = a.protocol.replace("http", "ws");
      return a.href;
    } else {
      return url;
    }
  }
  var Consumer;
  var init_consumer = __esm({
    "node_modules/@rails/actioncable/src/consumer.js"() {
      init_connection();
      init_subscriptions();
      Consumer = class {
        constructor(url) {
          this._url = url;
          this.subscriptions = new Subscriptions(this);
          this.connection = new connection_default(this);
        }
        get url() {
          return createWebSocketURL(this._url);
        }
        send(data) {
          return this.connection.send(data);
        }
        connect() {
          return this.connection.open();
        }
        disconnect() {
          return this.connection.close({ allowReconnect: false });
        }
        ensureActiveConnection() {
          if (!this.connection.isActive()) {
            return this.connection.open();
          }
        }
      };
    }
  });

  // node_modules/@rails/actioncable/src/index.js
  var src_exports = {};
  __export(src_exports, {
    Connection: () => connection_default,
    ConnectionMonitor: () => connection_monitor_default,
    Consumer: () => Consumer,
    INTERNAL: () => internal_default,
    Subscription: () => Subscription,
    SubscriptionGuarantor: () => subscription_guarantor_default,
    Subscriptions: () => Subscriptions,
    adapters: () => adapters_default,
    createConsumer: () => createConsumer,
    createWebSocketURL: () => createWebSocketURL,
    getConfig: () => getConfig,
    logger: () => logger_default
  });
  function createConsumer(url = getConfig("url") || internal_default.default_mount_path) {
    return new Consumer(url);
  }
  function getConfig(name) {
    const element = document.head.querySelector(`meta[name='action-cable-${name}']`);
    if (element) {
      return element.getAttribute("content");
    }
  }
  var init_src = __esm({
    "node_modules/@rails/actioncable/src/index.js"() {
      init_connection();
      init_connection_monitor();
      init_consumer();
      init_internal();
      init_subscription();
      init_subscriptions();
      init_subscription_guarantor();
      init_adapters();
      init_logger();
    }
  });

  // node_modules/@rails/ujs/lib/assets/compiled/rails-ujs.js
  var require_rails_ujs = __commonJS({
    "node_modules/@rails/ujs/lib/assets/compiled/rails-ujs.js"(exports, module) {
      (function() {
        var context = this;
        (function() {
          (function() {
            this.Rails = {
              linkClickSelector: "a[data-confirm], a[data-method], a[data-remote]:not([disabled]), a[data-disable-with], a[data-disable]",
              buttonClickSelector: {
                selector: "button[data-remote]:not([form]), button[data-confirm]:not([form])",
                exclude: "form button"
              },
              inputChangeSelector: "select[data-remote], input[data-remote], textarea[data-remote]",
              formSubmitSelector: "form:not([data-turbo=true])",
              formInputClickSelector: "form:not([data-turbo=true]) input[type=submit], form:not([data-turbo=true]) input[type=image], form:not([data-turbo=true]) button[type=submit], form:not([data-turbo=true]) button:not([type]), input[type=submit][form], input[type=image][form], button[type=submit][form], button[form]:not([type])",
              formDisableSelector: "input[data-disable-with]:enabled, button[data-disable-with]:enabled, textarea[data-disable-with]:enabled, input[data-disable]:enabled, button[data-disable]:enabled, textarea[data-disable]:enabled",
              formEnableSelector: "input[data-disable-with]:disabled, button[data-disable-with]:disabled, textarea[data-disable-with]:disabled, input[data-disable]:disabled, button[data-disable]:disabled, textarea[data-disable]:disabled",
              fileInputSelector: "input[name][type=file]:not([disabled])",
              linkDisableSelector: "a[data-disable-with], a[data-disable]",
              buttonDisableSelector: "button[data-remote][data-disable-with], button[data-remote][data-disable]"
            };
          }).call(this);
        }).call(context);
        var Rails2 = context.Rails;
        (function() {
          (function() {
            var nonce;
            nonce = null;
            Rails2.loadCSPNonce = function() {
              var ref;
              return nonce = (ref = document.querySelector("meta[name=csp-nonce]")) != null ? ref.content : void 0;
            };
            Rails2.cspNonce = function() {
              return nonce != null ? nonce : Rails2.loadCSPNonce();
            };
          }).call(this);
          (function() {
            var expando, m;
            m = Element.prototype.matches || Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector;
            Rails2.matches = function(element, selector) {
              if (selector.exclude != null) {
                return m.call(element, selector.selector) && !m.call(element, selector.exclude);
              } else {
                return m.call(element, selector);
              }
            };
            expando = "_ujsData";
            Rails2.getData = function(element, key) {
              var ref;
              return (ref = element[expando]) != null ? ref[key] : void 0;
            };
            Rails2.setData = function(element, key, value) {
              if (element[expando] == null) {
                element[expando] = {};
              }
              return element[expando][key] = value;
            };
            Rails2.$ = function(selector) {
              return Array.prototype.slice.call(document.querySelectorAll(selector));
            };
          }).call(this);
          (function() {
            var $, csrfParam, csrfToken;
            $ = Rails2.$;
            csrfToken = Rails2.csrfToken = function() {
              var meta;
              meta = document.querySelector("meta[name=csrf-token]");
              return meta && meta.content;
            };
            csrfParam = Rails2.csrfParam = function() {
              var meta;
              meta = document.querySelector("meta[name=csrf-param]");
              return meta && meta.content;
            };
            Rails2.CSRFProtection = function(xhr) {
              var token;
              token = csrfToken();
              if (token != null) {
                return xhr.setRequestHeader("X-CSRF-Token", token);
              }
            };
            Rails2.refreshCSRFTokens = function() {
              var param, token;
              token = csrfToken();
              param = csrfParam();
              if (token != null && param != null) {
                return $('form input[name="' + param + '"]').forEach(function(input) {
                  return input.value = token;
                });
              }
            };
          }).call(this);
          (function() {
            var CustomEvent2, fire, matches, preventDefault;
            matches = Rails2.matches;
            CustomEvent2 = window.CustomEvent;
            if (typeof CustomEvent2 !== "function") {
              CustomEvent2 = function(event, params) {
                var evt;
                evt = document.createEvent("CustomEvent");
                evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
                return evt;
              };
              CustomEvent2.prototype = window.Event.prototype;
              preventDefault = CustomEvent2.prototype.preventDefault;
              CustomEvent2.prototype.preventDefault = function() {
                var result;
                result = preventDefault.call(this);
                if (this.cancelable && !this.defaultPrevented) {
                  Object.defineProperty(this, "defaultPrevented", {
                    get: function() {
                      return true;
                    }
                  });
                }
                return result;
              };
            }
            fire = Rails2.fire = function(obj, name, data) {
              var event;
              event = new CustomEvent2(name, {
                bubbles: true,
                cancelable: true,
                detail: data
              });
              obj.dispatchEvent(event);
              return !event.defaultPrevented;
            };
            Rails2.stopEverything = function(e) {
              fire(e.target, "ujs:everythingStopped");
              e.preventDefault();
              e.stopPropagation();
              return e.stopImmediatePropagation();
            };
            Rails2.delegate = function(element, selector, eventType, handler) {
              return element.addEventListener(eventType, function(e) {
                var target;
                target = e.target;
                while (!(!(target instanceof Element) || matches(target, selector))) {
                  target = target.parentNode;
                }
                if (target instanceof Element && handler.call(target, e) === false) {
                  e.preventDefault();
                  return e.stopPropagation();
                }
              });
            };
          }).call(this);
          (function() {
            var AcceptHeaders, CSRFProtection, createXHR, cspNonce, fire, prepareOptions, processResponse;
            cspNonce = Rails2.cspNonce, CSRFProtection = Rails2.CSRFProtection, fire = Rails2.fire;
            AcceptHeaders = {
              "*": "*/*",
              text: "text/plain",
              html: "text/html",
              xml: "application/xml, text/xml",
              json: "application/json, text/javascript",
              script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
            };
            Rails2.ajax = function(options) {
              var xhr;
              options = prepareOptions(options);
              xhr = createXHR(options, function() {
                var ref, response;
                response = processResponse((ref = xhr.response) != null ? ref : xhr.responseText, xhr.getResponseHeader("Content-Type"));
                if (Math.floor(xhr.status / 100) === 2) {
                  if (typeof options.success === "function") {
                    options.success(response, xhr.statusText, xhr);
                  }
                } else {
                  if (typeof options.error === "function") {
                    options.error(response, xhr.statusText, xhr);
                  }
                }
                return typeof options.complete === "function" ? options.complete(xhr, xhr.statusText) : void 0;
              });
              if (options.beforeSend != null && !options.beforeSend(xhr, options)) {
                return false;
              }
              if (xhr.readyState === XMLHttpRequest.OPENED) {
                return xhr.send(options.data);
              }
            };
            prepareOptions = function(options) {
              options.url = options.url || location.href;
              options.type = options.type.toUpperCase();
              if (options.type === "GET" && options.data) {
                if (options.url.indexOf("?") < 0) {
                  options.url += "?" + options.data;
                } else {
                  options.url += "&" + options.data;
                }
              }
              if (AcceptHeaders[options.dataType] == null) {
                options.dataType = "*";
              }
              options.accept = AcceptHeaders[options.dataType];
              if (options.dataType !== "*") {
                options.accept += ", */*; q=0.01";
              }
              return options;
            };
            createXHR = function(options, done) {
              var xhr;
              xhr = new XMLHttpRequest();
              xhr.open(options.type, options.url, true);
              xhr.setRequestHeader("Accept", options.accept);
              if (typeof options.data === "string") {
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
              }
              if (!options.crossDomain) {
                xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                CSRFProtection(xhr);
              }
              xhr.withCredentials = !!options.withCredentials;
              xhr.onreadystatechange = function() {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                  return done(xhr);
                }
              };
              return xhr;
            };
            processResponse = function(response, type) {
              var parser, script;
              if (typeof response === "string" && typeof type === "string") {
                if (type.match(/\bjson\b/)) {
                  try {
                    response = JSON.parse(response);
                  } catch (error2) {
                  }
                } else if (type.match(/\b(?:java|ecma)script\b/)) {
                  script = document.createElement("script");
                  script.setAttribute("nonce", cspNonce());
                  script.text = response;
                  document.head.appendChild(script).parentNode.removeChild(script);
                } else if (type.match(/\b(xml|html|svg)\b/)) {
                  parser = new DOMParser();
                  type = type.replace(/;.+/, "");
                  try {
                    response = parser.parseFromString(response, type);
                  } catch (error2) {
                  }
                }
              }
              return response;
            };
            Rails2.href = function(element) {
              return element.href;
            };
            Rails2.isCrossDomain = function(url) {
              var e, originAnchor, urlAnchor;
              originAnchor = document.createElement("a");
              originAnchor.href = location.href;
              urlAnchor = document.createElement("a");
              try {
                urlAnchor.href = url;
                return !((!urlAnchor.protocol || urlAnchor.protocol === ":") && !urlAnchor.host || originAnchor.protocol + "//" + originAnchor.host === urlAnchor.protocol + "//" + urlAnchor.host);
              } catch (error2) {
                e = error2;
                return true;
              }
            };
          }).call(this);
          (function() {
            var matches, toArray;
            matches = Rails2.matches;
            toArray = function(e) {
              return Array.prototype.slice.call(e);
            };
            Rails2.serializeElement = function(element, additionalParam) {
              var inputs, params;
              inputs = [element];
              if (matches(element, "form")) {
                inputs = toArray(element.elements);
              }
              params = [];
              inputs.forEach(function(input) {
                if (!input.name || input.disabled) {
                  return;
                }
                if (matches(input, "fieldset[disabled] *")) {
                  return;
                }
                if (matches(input, "select")) {
                  return toArray(input.options).forEach(function(option) {
                    if (option.selected) {
                      return params.push({
                        name: input.name,
                        value: option.value
                      });
                    }
                  });
                } else if (input.checked || ["radio", "checkbox", "submit"].indexOf(input.type) === -1) {
                  return params.push({
                    name: input.name,
                    value: input.value
                  });
                }
              });
              if (additionalParam) {
                params.push(additionalParam);
              }
              return params.map(function(param) {
                if (param.name != null) {
                  return encodeURIComponent(param.name) + "=" + encodeURIComponent(param.value);
                } else {
                  return param;
                }
              }).join("&");
            };
            Rails2.formElements = function(form, selector) {
              if (matches(form, "form")) {
                return toArray(form.elements).filter(function(el) {
                  return matches(el, selector);
                });
              } else {
                return toArray(form.querySelectorAll(selector));
              }
            };
          }).call(this);
          (function() {
            var allowAction, fire, stopEverything;
            fire = Rails2.fire, stopEverything = Rails2.stopEverything;
            Rails2.handleConfirm = function(e) {
              if (!allowAction(this)) {
                return stopEverything(e);
              }
            };
            Rails2.confirm = function(message, element) {
              return confirm(message);
            };
            allowAction = function(element) {
              var answer, callback, message;
              message = element.getAttribute("data-confirm");
              if (!message) {
                return true;
              }
              answer = false;
              if (fire(element, "confirm")) {
                try {
                  answer = Rails2.confirm(message, element);
                } catch (error2) {
                }
                callback = fire(element, "confirm:complete", [answer]);
              }
              return answer && callback;
            };
          }).call(this);
          (function() {
            var disableFormElement, disableFormElements, disableLinkElement, enableFormElement, enableFormElements, enableLinkElement, formElements, getData, isXhrRedirect, matches, setData, stopEverything;
            matches = Rails2.matches, getData = Rails2.getData, setData = Rails2.setData, stopEverything = Rails2.stopEverything, formElements = Rails2.formElements;
            Rails2.handleDisabledElement = function(e) {
              var element;
              element = this;
              if (element.disabled) {
                return stopEverything(e);
              }
            };
            Rails2.enableElement = function(e) {
              var element;
              if (e instanceof Event) {
                if (isXhrRedirect(e)) {
                  return;
                }
                element = e.target;
              } else {
                element = e;
              }
              if (matches(element, Rails2.linkDisableSelector)) {
                return enableLinkElement(element);
              } else if (matches(element, Rails2.buttonDisableSelector) || matches(element, Rails2.formEnableSelector)) {
                return enableFormElement(element);
              } else if (matches(element, Rails2.formSubmitSelector)) {
                return enableFormElements(element);
              }
            };
            Rails2.disableElement = function(e) {
              var element;
              element = e instanceof Event ? e.target : e;
              if (matches(element, Rails2.linkDisableSelector)) {
                return disableLinkElement(element);
              } else if (matches(element, Rails2.buttonDisableSelector) || matches(element, Rails2.formDisableSelector)) {
                return disableFormElement(element);
              } else if (matches(element, Rails2.formSubmitSelector)) {
                return disableFormElements(element);
              }
            };
            disableLinkElement = function(element) {
              var replacement;
              if (getData(element, "ujs:disabled")) {
                return;
              }
              replacement = element.getAttribute("data-disable-with");
              if (replacement != null) {
                setData(element, "ujs:enable-with", element.innerHTML);
                element.innerHTML = replacement;
              }
              element.addEventListener("click", stopEverything);
              return setData(element, "ujs:disabled", true);
            };
            enableLinkElement = function(element) {
              var originalText;
              originalText = getData(element, "ujs:enable-with");
              if (originalText != null) {
                element.innerHTML = originalText;
                setData(element, "ujs:enable-with", null);
              }
              element.removeEventListener("click", stopEverything);
              return setData(element, "ujs:disabled", null);
            };
            disableFormElements = function(form) {
              return formElements(form, Rails2.formDisableSelector).forEach(disableFormElement);
            };
            disableFormElement = function(element) {
              var replacement;
              if (getData(element, "ujs:disabled")) {
                return;
              }
              replacement = element.getAttribute("data-disable-with");
              if (replacement != null) {
                if (matches(element, "button")) {
                  setData(element, "ujs:enable-with", element.innerHTML);
                  element.innerHTML = replacement;
                } else {
                  setData(element, "ujs:enable-with", element.value);
                  element.value = replacement;
                }
              }
              element.disabled = true;
              return setData(element, "ujs:disabled", true);
            };
            enableFormElements = function(form) {
              return formElements(form, Rails2.formEnableSelector).forEach(enableFormElement);
            };
            enableFormElement = function(element) {
              var originalText;
              originalText = getData(element, "ujs:enable-with");
              if (originalText != null) {
                if (matches(element, "button")) {
                  element.innerHTML = originalText;
                } else {
                  element.value = originalText;
                }
                setData(element, "ujs:enable-with", null);
              }
              element.disabled = false;
              return setData(element, "ujs:disabled", null);
            };
            isXhrRedirect = function(event) {
              var ref, xhr;
              xhr = (ref = event.detail) != null ? ref[0] : void 0;
              return (xhr != null ? xhr.getResponseHeader("X-Xhr-Redirect") : void 0) != null;
            };
          }).call(this);
          (function() {
            var stopEverything;
            stopEverything = Rails2.stopEverything;
            Rails2.handleMethod = function(e) {
              var csrfParam, csrfToken, form, formContent, href, link, method;
              link = this;
              method = link.getAttribute("data-method");
              if (!method) {
                return;
              }
              href = Rails2.href(link);
              csrfToken = Rails2.csrfToken();
              csrfParam = Rails2.csrfParam();
              form = document.createElement("form");
              formContent = "<input name='_method' value='" + method + "' type='hidden' />";
              if (csrfParam != null && csrfToken != null && !Rails2.isCrossDomain(href)) {
                formContent += "<input name='" + csrfParam + "' value='" + csrfToken + "' type='hidden' />";
              }
              formContent += '<input type="submit" />';
              form.method = "post";
              form.action = href;
              form.target = link.target;
              form.innerHTML = formContent;
              form.style.display = "none";
              document.body.appendChild(form);
              form.querySelector('[type="submit"]').click();
              return stopEverything(e);
            };
          }).call(this);
          (function() {
            var ajax, fire, getData, isCrossDomain, isRemote, matches, serializeElement, setData, stopEverything, slice = [].slice;
            matches = Rails2.matches, getData = Rails2.getData, setData = Rails2.setData, fire = Rails2.fire, stopEverything = Rails2.stopEverything, ajax = Rails2.ajax, isCrossDomain = Rails2.isCrossDomain, serializeElement = Rails2.serializeElement;
            isRemote = function(element) {
              var value;
              value = element.getAttribute("data-remote");
              return value != null && value !== "false";
            };
            Rails2.handleRemote = function(e) {
              var button, data, dataType, element, method, url, withCredentials;
              element = this;
              if (!isRemote(element)) {
                return true;
              }
              if (!fire(element, "ajax:before")) {
                fire(element, "ajax:stopped");
                return false;
              }
              withCredentials = element.getAttribute("data-with-credentials");
              dataType = element.getAttribute("data-type") || "script";
              if (matches(element, Rails2.formSubmitSelector)) {
                button = getData(element, "ujs:submit-button");
                method = getData(element, "ujs:submit-button-formmethod") || element.method;
                url = getData(element, "ujs:submit-button-formaction") || element.getAttribute("action") || location.href;
                if (method.toUpperCase() === "GET") {
                  url = url.replace(/\?.*$/, "");
                }
                if (element.enctype === "multipart/form-data") {
                  data = new FormData(element);
                  if (button != null) {
                    data.append(button.name, button.value);
                  }
                } else {
                  data = serializeElement(element, button);
                }
                setData(element, "ujs:submit-button", null);
                setData(element, "ujs:submit-button-formmethod", null);
                setData(element, "ujs:submit-button-formaction", null);
              } else if (matches(element, Rails2.buttonClickSelector) || matches(element, Rails2.inputChangeSelector)) {
                method = element.getAttribute("data-method");
                url = element.getAttribute("data-url");
                data = serializeElement(element, element.getAttribute("data-params"));
              } else {
                method = element.getAttribute("data-method");
                url = Rails2.href(element);
                data = element.getAttribute("data-params");
              }
              ajax({
                type: method || "GET",
                url,
                data,
                dataType,
                beforeSend: function(xhr, options) {
                  if (fire(element, "ajax:beforeSend", [xhr, options])) {
                    return fire(element, "ajax:send", [xhr]);
                  } else {
                    fire(element, "ajax:stopped");
                    return false;
                  }
                },
                success: function() {
                  var args;
                  args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
                  return fire(element, "ajax:success", args);
                },
                error: function() {
                  var args;
                  args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
                  return fire(element, "ajax:error", args);
                },
                complete: function() {
                  var args;
                  args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
                  return fire(element, "ajax:complete", args);
                },
                crossDomain: isCrossDomain(url),
                withCredentials: withCredentials != null && withCredentials !== "false"
              });
              return stopEverything(e);
            };
            Rails2.formSubmitButtonClick = function(e) {
              var button, form;
              button = this;
              form = button.form;
              if (!form) {
                return;
              }
              if (button.name) {
                setData(form, "ujs:submit-button", {
                  name: button.name,
                  value: button.value
                });
              }
              setData(form, "ujs:formnovalidate-button", button.formNoValidate);
              setData(form, "ujs:submit-button-formaction", button.getAttribute("formaction"));
              return setData(form, "ujs:submit-button-formmethod", button.getAttribute("formmethod"));
            };
            Rails2.preventInsignificantClick = function(e) {
              var data, insignificantMetaClick, link, metaClick, method, nonPrimaryMouseClick;
              link = this;
              method = (link.getAttribute("data-method") || "GET").toUpperCase();
              data = link.getAttribute("data-params");
              metaClick = e.metaKey || e.ctrlKey;
              insignificantMetaClick = metaClick && method === "GET" && !data;
              nonPrimaryMouseClick = e.button != null && e.button !== 0;
              if (nonPrimaryMouseClick || insignificantMetaClick) {
                return e.stopImmediatePropagation();
              }
            };
          }).call(this);
          (function() {
            var $, CSRFProtection, delegate, disableElement, enableElement, fire, formSubmitButtonClick, getData, handleConfirm, handleDisabledElement, handleMethod, handleRemote, loadCSPNonce, preventInsignificantClick, refreshCSRFTokens;
            fire = Rails2.fire, delegate = Rails2.delegate, getData = Rails2.getData, $ = Rails2.$, refreshCSRFTokens = Rails2.refreshCSRFTokens, CSRFProtection = Rails2.CSRFProtection, loadCSPNonce = Rails2.loadCSPNonce, enableElement = Rails2.enableElement, disableElement = Rails2.disableElement, handleDisabledElement = Rails2.handleDisabledElement, handleConfirm = Rails2.handleConfirm, preventInsignificantClick = Rails2.preventInsignificantClick, handleRemote = Rails2.handleRemote, formSubmitButtonClick = Rails2.formSubmitButtonClick, handleMethod = Rails2.handleMethod;
            if (typeof jQuery !== "undefined" && jQuery !== null && jQuery.ajax != null) {
              if (jQuery.rails) {
                throw new Error("If you load both jquery_ujs and rails-ujs, use rails-ujs only.");
              }
              jQuery.rails = Rails2;
              jQuery.ajaxPrefilter(function(options, originalOptions, xhr) {
                if (!options.crossDomain) {
                  return CSRFProtection(xhr);
                }
              });
            }
            Rails2.start = function() {
              if (window._rails_loaded) {
                throw new Error("rails-ujs has already been loaded!");
              }
              window.addEventListener("pageshow", function() {
                $(Rails2.formEnableSelector).forEach(function(el) {
                  if (getData(el, "ujs:disabled")) {
                    return enableElement(el);
                  }
                });
                return $(Rails2.linkDisableSelector).forEach(function(el) {
                  if (getData(el, "ujs:disabled")) {
                    return enableElement(el);
                  }
                });
              });
              delegate(document, Rails2.linkDisableSelector, "ajax:complete", enableElement);
              delegate(document, Rails2.linkDisableSelector, "ajax:stopped", enableElement);
              delegate(document, Rails2.buttonDisableSelector, "ajax:complete", enableElement);
              delegate(document, Rails2.buttonDisableSelector, "ajax:stopped", enableElement);
              delegate(document, Rails2.linkClickSelector, "click", preventInsignificantClick);
              delegate(document, Rails2.linkClickSelector, "click", handleDisabledElement);
              delegate(document, Rails2.linkClickSelector, "click", handleConfirm);
              delegate(document, Rails2.linkClickSelector, "click", disableElement);
              delegate(document, Rails2.linkClickSelector, "click", handleRemote);
              delegate(document, Rails2.linkClickSelector, "click", handleMethod);
              delegate(document, Rails2.buttonClickSelector, "click", preventInsignificantClick);
              delegate(document, Rails2.buttonClickSelector, "click", handleDisabledElement);
              delegate(document, Rails2.buttonClickSelector, "click", handleConfirm);
              delegate(document, Rails2.buttonClickSelector, "click", disableElement);
              delegate(document, Rails2.buttonClickSelector, "click", handleRemote);
              delegate(document, Rails2.inputChangeSelector, "change", handleDisabledElement);
              delegate(document, Rails2.inputChangeSelector, "change", handleConfirm);
              delegate(document, Rails2.inputChangeSelector, "change", handleRemote);
              delegate(document, Rails2.formSubmitSelector, "submit", handleDisabledElement);
              delegate(document, Rails2.formSubmitSelector, "submit", handleConfirm);
              delegate(document, Rails2.formSubmitSelector, "submit", handleRemote);
              delegate(document, Rails2.formSubmitSelector, "submit", function(e) {
                return setTimeout(function() {
                  return disableElement(e);
                }, 13);
              });
              delegate(document, Rails2.formSubmitSelector, "ajax:send", disableElement);
              delegate(document, Rails2.formSubmitSelector, "ajax:complete", enableElement);
              delegate(document, Rails2.formInputClickSelector, "click", preventInsignificantClick);
              delegate(document, Rails2.formInputClickSelector, "click", handleDisabledElement);
              delegate(document, Rails2.formInputClickSelector, "click", handleConfirm);
              delegate(document, Rails2.formInputClickSelector, "click", formSubmitButtonClick);
              document.addEventListener("DOMContentLoaded", refreshCSRFTokens);
              document.addEventListener("DOMContentLoaded", loadCSPNonce);
              return window._rails_loaded = true;
            };
            if (window.Rails === Rails2 && fire(document, "rails:attachBindings")) {
              Rails2.start();
            }
          }).call(this);
        }).call(this);
        if (typeof module === "object" && module.exports) {
          module.exports = Rails2;
        } else if (typeof define === "function" && define.amd) {
          define(Rails2);
        }
      }).call(exports);
    }
  });

  // node_modules/@hotwired/turbo/dist/turbo.es2017-esm.js
  (function() {
    if (window.Reflect === void 0 || window.customElements === void 0 || window.customElements.polyfillWrapFlushCallback) {
      return;
    }
    const BuiltInHTMLElement = HTMLElement;
    const wrapperForTheName = {
      HTMLElement: function HTMLElement2() {
        return Reflect.construct(BuiltInHTMLElement, [], this.constructor);
      }
    };
    window.HTMLElement = wrapperForTheName["HTMLElement"];
    HTMLElement.prototype = BuiltInHTMLElement.prototype;
    HTMLElement.prototype.constructor = HTMLElement;
    Object.setPrototypeOf(HTMLElement, BuiltInHTMLElement);
  })();
  (function(prototype) {
    if (typeof prototype.requestSubmit == "function")
      return;
    prototype.requestSubmit = function(submitter) {
      if (submitter) {
        validateSubmitter(submitter, this);
        submitter.click();
      } else {
        submitter = document.createElement("input");
        submitter.type = "submit";
        submitter.hidden = true;
        this.appendChild(submitter);
        submitter.click();
        this.removeChild(submitter);
      }
    };
    function validateSubmitter(submitter, form) {
      submitter instanceof HTMLElement || raise(TypeError, "parameter 1 is not of type 'HTMLElement'");
      submitter.type == "submit" || raise(TypeError, "The specified element is not a submit button");
      submitter.form == form || raise(DOMException, "The specified element is not owned by this form element", "NotFoundError");
    }
    function raise(errorConstructor, message, name) {
      throw new errorConstructor("Failed to execute 'requestSubmit' on 'HTMLFormElement': " + message + ".", name);
    }
  })(HTMLFormElement.prototype);
  var submittersByForm = /* @__PURE__ */ new WeakMap();
  function findSubmitterFromClickTarget(target) {
    const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
    const candidate = element ? element.closest("input, button") : null;
    return (candidate === null || candidate === void 0 ? void 0 : candidate.type) == "submit" ? candidate : null;
  }
  function clickCaptured(event) {
    const submitter = findSubmitterFromClickTarget(event.target);
    if (submitter && submitter.form) {
      submittersByForm.set(submitter.form, submitter);
    }
  }
  (function() {
    if ("submitter" in Event.prototype)
      return;
    let prototype;
    if ("SubmitEvent" in window && /Apple Computer/.test(navigator.vendor)) {
      prototype = window.SubmitEvent.prototype;
    } else if ("SubmitEvent" in window) {
      return;
    } else {
      prototype = window.Event.prototype;
    }
    addEventListener("click", clickCaptured, true);
    Object.defineProperty(prototype, "submitter", {
      get() {
        if (this.type == "submit" && this.target instanceof HTMLFormElement) {
          return submittersByForm.get(this.target);
        }
      }
    });
  })();
  var FrameLoadingStyle;
  (function(FrameLoadingStyle2) {
    FrameLoadingStyle2["eager"] = "eager";
    FrameLoadingStyle2["lazy"] = "lazy";
  })(FrameLoadingStyle || (FrameLoadingStyle = {}));
  var FrameElement = class extends HTMLElement {
    constructor() {
      super();
      this.loaded = Promise.resolve();
      this.delegate = new FrameElement.delegateConstructor(this);
    }
    static get observedAttributes() {
      return ["disabled", "complete", "loading", "src"];
    }
    connectedCallback() {
      this.delegate.connect();
    }
    disconnectedCallback() {
      this.delegate.disconnect();
    }
    reload() {
      return this.delegate.sourceURLReloaded();
    }
    attributeChangedCallback(name) {
      if (name == "loading") {
        this.delegate.loadingStyleChanged();
      } else if (name == "complete") {
        this.delegate.completeChanged();
      } else if (name == "src") {
        this.delegate.sourceURLChanged();
      } else {
        this.delegate.disabledChanged();
      }
    }
    get src() {
      return this.getAttribute("src");
    }
    set src(value) {
      if (value) {
        this.setAttribute("src", value);
      } else {
        this.removeAttribute("src");
      }
    }
    get loading() {
      return frameLoadingStyleFromString(this.getAttribute("loading") || "");
    }
    set loading(value) {
      if (value) {
        this.setAttribute("loading", value);
      } else {
        this.removeAttribute("loading");
      }
    }
    get disabled() {
      return this.hasAttribute("disabled");
    }
    set disabled(value) {
      if (value) {
        this.setAttribute("disabled", "");
      } else {
        this.removeAttribute("disabled");
      }
    }
    get autoscroll() {
      return this.hasAttribute("autoscroll");
    }
    set autoscroll(value) {
      if (value) {
        this.setAttribute("autoscroll", "");
      } else {
        this.removeAttribute("autoscroll");
      }
    }
    get complete() {
      return !this.delegate.isLoading;
    }
    get isActive() {
      return this.ownerDocument === document && !this.isPreview;
    }
    get isPreview() {
      var _a, _b;
      return (_b = (_a = this.ownerDocument) === null || _a === void 0 ? void 0 : _a.documentElement) === null || _b === void 0 ? void 0 : _b.hasAttribute("data-turbo-preview");
    }
  };
  function frameLoadingStyleFromString(style) {
    switch (style.toLowerCase()) {
      case "lazy":
        return FrameLoadingStyle.lazy;
      default:
        return FrameLoadingStyle.eager;
    }
  }
  function expandURL(locatable) {
    return new URL(locatable.toString(), document.baseURI);
  }
  function getAnchor(url) {
    let anchorMatch;
    if (url.hash) {
      return url.hash.slice(1);
    } else if (anchorMatch = url.href.match(/#(.*)$/)) {
      return anchorMatch[1];
    }
  }
  function getAction(form, submitter) {
    const action = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("formaction")) || form.getAttribute("action") || form.action;
    return expandURL(action);
  }
  function getExtension(url) {
    return (getLastPathComponent(url).match(/\.[^.]*$/) || [])[0] || "";
  }
  function isHTML(url) {
    return !!getExtension(url).match(/^(?:|\.(?:htm|html|xhtml|php))$/);
  }
  function isPrefixedBy(baseURL, url) {
    const prefix = getPrefix(url);
    return baseURL.href === expandURL(prefix).href || baseURL.href.startsWith(prefix);
  }
  function locationIsVisitable(location2, rootLocation) {
    return isPrefixedBy(location2, rootLocation) && isHTML(location2);
  }
  function getRequestURL(url) {
    const anchor = getAnchor(url);
    return anchor != null ? url.href.slice(0, -(anchor.length + 1)) : url.href;
  }
  function toCacheKey(url) {
    return getRequestURL(url);
  }
  function urlsAreEqual(left, right) {
    return expandURL(left).href == expandURL(right).href;
  }
  function getPathComponents(url) {
    return url.pathname.split("/").slice(1);
  }
  function getLastPathComponent(url) {
    return getPathComponents(url).slice(-1)[0];
  }
  function getPrefix(url) {
    return addTrailingSlash(url.origin + url.pathname);
  }
  function addTrailingSlash(value) {
    return value.endsWith("/") ? value : value + "/";
  }
  var FetchResponse = class {
    constructor(response) {
      this.response = response;
    }
    get succeeded() {
      return this.response.ok;
    }
    get failed() {
      return !this.succeeded;
    }
    get clientError() {
      return this.statusCode >= 400 && this.statusCode <= 499;
    }
    get serverError() {
      return this.statusCode >= 500 && this.statusCode <= 599;
    }
    get redirected() {
      return this.response.redirected;
    }
    get location() {
      return expandURL(this.response.url);
    }
    get isHTML() {
      return this.contentType && this.contentType.match(/^(?:text\/([^\s;,]+\b)?html|application\/xhtml\+xml)\b/);
    }
    get statusCode() {
      return this.response.status;
    }
    get contentType() {
      return this.header("Content-Type");
    }
    get responseText() {
      return this.response.clone().text();
    }
    get responseHTML() {
      if (this.isHTML) {
        return this.response.clone().text();
      } else {
        return Promise.resolve(void 0);
      }
    }
    header(name) {
      return this.response.headers.get(name);
    }
  };
  function activateScriptElement(element) {
    if (element.getAttribute("data-turbo-eval") == "false") {
      return element;
    } else {
      const createdScriptElement = document.createElement("script");
      const cspNonce = getMetaContent("csp-nonce");
      if (cspNonce) {
        createdScriptElement.nonce = cspNonce;
      }
      createdScriptElement.textContent = element.textContent;
      createdScriptElement.async = false;
      copyElementAttributes(createdScriptElement, element);
      return createdScriptElement;
    }
  }
  function copyElementAttributes(destinationElement, sourceElement) {
    for (const { name, value } of sourceElement.attributes) {
      destinationElement.setAttribute(name, value);
    }
  }
  function createDocumentFragment(html) {
    const template = document.createElement("template");
    template.innerHTML = html;
    return template.content;
  }
  function dispatch(eventName, { target, cancelable, detail } = {}) {
    const event = new CustomEvent(eventName, {
      cancelable,
      bubbles: true,
      composed: true,
      detail
    });
    if (target && target.isConnected) {
      target.dispatchEvent(event);
    } else {
      document.documentElement.dispatchEvent(event);
    }
    return event;
  }
  function nextAnimationFrame() {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }
  function nextEventLoopTick() {
    return new Promise((resolve) => setTimeout(() => resolve(), 0));
  }
  function nextMicrotask() {
    return Promise.resolve();
  }
  function parseHTMLDocument(html = "") {
    return new DOMParser().parseFromString(html, "text/html");
  }
  function unindent(strings, ...values) {
    const lines = interpolate(strings, values).replace(/^\n/, "").split("\n");
    const match = lines[0].match(/^\s+/);
    const indent = match ? match[0].length : 0;
    return lines.map((line) => line.slice(indent)).join("\n");
  }
  function interpolate(strings, values) {
    return strings.reduce((result, string, i) => {
      const value = values[i] == void 0 ? "" : values[i];
      return result + string + value;
    }, "");
  }
  function uuid() {
    return Array.from({ length: 36 }).map((_, i) => {
      if (i == 8 || i == 13 || i == 18 || i == 23) {
        return "-";
      } else if (i == 14) {
        return "4";
      } else if (i == 19) {
        return (Math.floor(Math.random() * 4) + 8).toString(16);
      } else {
        return Math.floor(Math.random() * 15).toString(16);
      }
    }).join("");
  }
  function getAttribute(attributeName, ...elements) {
    for (const value of elements.map((element) => element === null || element === void 0 ? void 0 : element.getAttribute(attributeName))) {
      if (typeof value == "string")
        return value;
    }
    return null;
  }
  function hasAttribute(attributeName, ...elements) {
    return elements.some((element) => element && element.hasAttribute(attributeName));
  }
  function markAsBusy(...elements) {
    for (const element of elements) {
      if (element.localName == "turbo-frame") {
        element.setAttribute("busy", "");
      }
      element.setAttribute("aria-busy", "true");
    }
  }
  function clearBusyState(...elements) {
    for (const element of elements) {
      if (element.localName == "turbo-frame") {
        element.removeAttribute("busy");
      }
      element.removeAttribute("aria-busy");
    }
  }
  function waitForLoad(element, timeoutInMilliseconds = 2e3) {
    return new Promise((resolve) => {
      const onComplete = () => {
        element.removeEventListener("error", onComplete);
        element.removeEventListener("load", onComplete);
        resolve();
      };
      element.addEventListener("load", onComplete, { once: true });
      element.addEventListener("error", onComplete, { once: true });
      setTimeout(resolve, timeoutInMilliseconds);
    });
  }
  function getHistoryMethodForAction(action) {
    switch (action) {
      case "replace":
        return history.replaceState;
      case "advance":
      case "restore":
        return history.pushState;
    }
  }
  function isAction(action) {
    return action == "advance" || action == "replace" || action == "restore";
  }
  function getVisitAction(...elements) {
    const action = getAttribute("data-turbo-action", ...elements);
    return isAction(action) ? action : null;
  }
  function getMetaElement(name) {
    return document.querySelector(`meta[name="${name}"]`);
  }
  function getMetaContent(name) {
    const element = getMetaElement(name);
    return element && element.content;
  }
  function setMetaContent(name, content) {
    let element = getMetaElement(name);
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute("name", name);
      document.head.appendChild(element);
    }
    element.setAttribute("content", content);
    return element;
  }
  function findClosestRecursively(element, selector) {
    var _a;
    if (element instanceof Element) {
      return element.closest(selector) || findClosestRecursively(element.assignedSlot || ((_a = element.getRootNode()) === null || _a === void 0 ? void 0 : _a.host), selector);
    }
  }
  var FetchMethod;
  (function(FetchMethod2) {
    FetchMethod2[FetchMethod2["get"] = 0] = "get";
    FetchMethod2[FetchMethod2["post"] = 1] = "post";
    FetchMethod2[FetchMethod2["put"] = 2] = "put";
    FetchMethod2[FetchMethod2["patch"] = 3] = "patch";
    FetchMethod2[FetchMethod2["delete"] = 4] = "delete";
  })(FetchMethod || (FetchMethod = {}));
  function fetchMethodFromString(method) {
    switch (method.toLowerCase()) {
      case "get":
        return FetchMethod.get;
      case "post":
        return FetchMethod.post;
      case "put":
        return FetchMethod.put;
      case "patch":
        return FetchMethod.patch;
      case "delete":
        return FetchMethod.delete;
    }
  }
  var FetchRequest = class {
    constructor(delegate, method, location2, body = new URLSearchParams(), target = null) {
      this.abortController = new AbortController();
      this.resolveRequestPromise = (_value) => {
      };
      this.delegate = delegate;
      this.method = method;
      this.headers = this.defaultHeaders;
      this.body = body;
      this.url = location2;
      this.target = target;
    }
    get location() {
      return this.url;
    }
    get params() {
      return this.url.searchParams;
    }
    get entries() {
      return this.body ? Array.from(this.body.entries()) : [];
    }
    cancel() {
      this.abortController.abort();
    }
    async perform() {
      const { fetchOptions } = this;
      this.delegate.prepareRequest(this);
      await this.allowRequestToBeIntercepted(fetchOptions);
      try {
        this.delegate.requestStarted(this);
        const response = await fetch(this.url.href, fetchOptions);
        return await this.receive(response);
      } catch (error2) {
        if (error2.name !== "AbortError") {
          if (this.willDelegateErrorHandling(error2)) {
            this.delegate.requestErrored(this, error2);
          }
          throw error2;
        }
      } finally {
        this.delegate.requestFinished(this);
      }
    }
    async receive(response) {
      const fetchResponse = new FetchResponse(response);
      const event = dispatch("turbo:before-fetch-response", {
        cancelable: true,
        detail: { fetchResponse },
        target: this.target
      });
      if (event.defaultPrevented) {
        this.delegate.requestPreventedHandlingResponse(this, fetchResponse);
      } else if (fetchResponse.succeeded) {
        this.delegate.requestSucceededWithResponse(this, fetchResponse);
      } else {
        this.delegate.requestFailedWithResponse(this, fetchResponse);
      }
      return fetchResponse;
    }
    get fetchOptions() {
      var _a;
      return {
        method: FetchMethod[this.method].toUpperCase(),
        credentials: "same-origin",
        headers: this.headers,
        redirect: "follow",
        body: this.isIdempotent ? null : this.body,
        signal: this.abortSignal,
        referrer: (_a = this.delegate.referrer) === null || _a === void 0 ? void 0 : _a.href
      };
    }
    get defaultHeaders() {
      return {
        Accept: "text/html, application/xhtml+xml"
      };
    }
    get isIdempotent() {
      return this.method == FetchMethod.get;
    }
    get abortSignal() {
      return this.abortController.signal;
    }
    acceptResponseType(mimeType) {
      this.headers["Accept"] = [mimeType, this.headers["Accept"]].join(", ");
    }
    async allowRequestToBeIntercepted(fetchOptions) {
      const requestInterception = new Promise((resolve) => this.resolveRequestPromise = resolve);
      const event = dispatch("turbo:before-fetch-request", {
        cancelable: true,
        detail: {
          fetchOptions,
          url: this.url,
          resume: this.resolveRequestPromise
        },
        target: this.target
      });
      if (event.defaultPrevented)
        await requestInterception;
    }
    willDelegateErrorHandling(error2) {
      const event = dispatch("turbo:fetch-request-error", {
        target: this.target,
        cancelable: true,
        detail: { request: this, error: error2 }
      });
      return !event.defaultPrevented;
    }
  };
  var AppearanceObserver = class {
    constructor(delegate, element) {
      this.started = false;
      this.intersect = (entries) => {
        const lastEntry = entries.slice(-1)[0];
        if (lastEntry === null || lastEntry === void 0 ? void 0 : lastEntry.isIntersecting) {
          this.delegate.elementAppearedInViewport(this.element);
        }
      };
      this.delegate = delegate;
      this.element = element;
      this.intersectionObserver = new IntersectionObserver(this.intersect);
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.intersectionObserver.observe(this.element);
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        this.intersectionObserver.unobserve(this.element);
      }
    }
  };
  var StreamMessage = class {
    constructor(fragment) {
      this.fragment = importStreamElements(fragment);
    }
    static wrap(message) {
      if (typeof message == "string") {
        return new this(createDocumentFragment(message));
      } else {
        return message;
      }
    }
  };
  StreamMessage.contentType = "text/vnd.turbo-stream.html";
  function importStreamElements(fragment) {
    for (const element of fragment.querySelectorAll("turbo-stream")) {
      const streamElement = document.importNode(element, true);
      for (const inertScriptElement of streamElement.templateElement.content.querySelectorAll("script")) {
        inertScriptElement.replaceWith(activateScriptElement(inertScriptElement));
      }
      element.replaceWith(streamElement);
    }
    return fragment;
  }
  var FormSubmissionState;
  (function(FormSubmissionState2) {
    FormSubmissionState2[FormSubmissionState2["initialized"] = 0] = "initialized";
    FormSubmissionState2[FormSubmissionState2["requesting"] = 1] = "requesting";
    FormSubmissionState2[FormSubmissionState2["waiting"] = 2] = "waiting";
    FormSubmissionState2[FormSubmissionState2["receiving"] = 3] = "receiving";
    FormSubmissionState2[FormSubmissionState2["stopping"] = 4] = "stopping";
    FormSubmissionState2[FormSubmissionState2["stopped"] = 5] = "stopped";
  })(FormSubmissionState || (FormSubmissionState = {}));
  var FormEnctype;
  (function(FormEnctype2) {
    FormEnctype2["urlEncoded"] = "application/x-www-form-urlencoded";
    FormEnctype2["multipart"] = "multipart/form-data";
    FormEnctype2["plain"] = "text/plain";
  })(FormEnctype || (FormEnctype = {}));
  function formEnctypeFromString(encoding) {
    switch (encoding.toLowerCase()) {
      case FormEnctype.multipart:
        return FormEnctype.multipart;
      case FormEnctype.plain:
        return FormEnctype.plain;
      default:
        return FormEnctype.urlEncoded;
    }
  }
  var FormSubmission = class {
    constructor(delegate, formElement, submitter, mustRedirect = false) {
      this.state = FormSubmissionState.initialized;
      this.delegate = delegate;
      this.formElement = formElement;
      this.submitter = submitter;
      this.formData = buildFormData(formElement, submitter);
      this.location = expandURL(this.action);
      if (this.method == FetchMethod.get) {
        mergeFormDataEntries(this.location, [...this.body.entries()]);
      }
      this.fetchRequest = new FetchRequest(this, this.method, this.location, this.body, this.formElement);
      this.mustRedirect = mustRedirect;
    }
    static confirmMethod(message, _element, _submitter) {
      return Promise.resolve(confirm(message));
    }
    get method() {
      var _a;
      const method = ((_a = this.submitter) === null || _a === void 0 ? void 0 : _a.getAttribute("formmethod")) || this.formElement.getAttribute("method") || "";
      return fetchMethodFromString(method.toLowerCase()) || FetchMethod.get;
    }
    get action() {
      var _a;
      const formElementAction = typeof this.formElement.action === "string" ? this.formElement.action : null;
      if ((_a = this.submitter) === null || _a === void 0 ? void 0 : _a.hasAttribute("formaction")) {
        return this.submitter.getAttribute("formaction") || "";
      } else {
        return this.formElement.getAttribute("action") || formElementAction || "";
      }
    }
    get body() {
      if (this.enctype == FormEnctype.urlEncoded || this.method == FetchMethod.get) {
        return new URLSearchParams(this.stringFormData);
      } else {
        return this.formData;
      }
    }
    get enctype() {
      var _a;
      return formEnctypeFromString(((_a = this.submitter) === null || _a === void 0 ? void 0 : _a.getAttribute("formenctype")) || this.formElement.enctype);
    }
    get isIdempotent() {
      return this.fetchRequest.isIdempotent;
    }
    get stringFormData() {
      return [...this.formData].reduce((entries, [name, value]) => {
        return entries.concat(typeof value == "string" ? [[name, value]] : []);
      }, []);
    }
    async start() {
      const { initialized, requesting } = FormSubmissionState;
      const confirmationMessage = getAttribute("data-turbo-confirm", this.submitter, this.formElement);
      if (typeof confirmationMessage === "string") {
        const answer = await FormSubmission.confirmMethod(confirmationMessage, this.formElement, this.submitter);
        if (!answer) {
          return;
        }
      }
      if (this.state == initialized) {
        this.state = requesting;
        return this.fetchRequest.perform();
      }
    }
    stop() {
      const { stopping, stopped } = FormSubmissionState;
      if (this.state != stopping && this.state != stopped) {
        this.state = stopping;
        this.fetchRequest.cancel();
        return true;
      }
    }
    prepareRequest(request) {
      if (!request.isIdempotent) {
        const token = getCookieValue(getMetaContent("csrf-param")) || getMetaContent("csrf-token");
        if (token) {
          request.headers["X-CSRF-Token"] = token;
        }
      }
      if (this.requestAcceptsTurboStreamResponse(request)) {
        request.acceptResponseType(StreamMessage.contentType);
      }
    }
    requestStarted(_request) {
      var _a;
      this.state = FormSubmissionState.waiting;
      (_a = this.submitter) === null || _a === void 0 ? void 0 : _a.setAttribute("disabled", "");
      dispatch("turbo:submit-start", {
        target: this.formElement,
        detail: { formSubmission: this }
      });
      this.delegate.formSubmissionStarted(this);
    }
    requestPreventedHandlingResponse(request, response) {
      this.result = { success: response.succeeded, fetchResponse: response };
    }
    requestSucceededWithResponse(request, response) {
      if (response.clientError || response.serverError) {
        this.delegate.formSubmissionFailedWithResponse(this, response);
      } else if (this.requestMustRedirect(request) && responseSucceededWithoutRedirect(response)) {
        const error2 = new Error("Form responses must redirect to another location");
        this.delegate.formSubmissionErrored(this, error2);
      } else {
        this.state = FormSubmissionState.receiving;
        this.result = { success: true, fetchResponse: response };
        this.delegate.formSubmissionSucceededWithResponse(this, response);
      }
    }
    requestFailedWithResponse(request, response) {
      this.result = { success: false, fetchResponse: response };
      this.delegate.formSubmissionFailedWithResponse(this, response);
    }
    requestErrored(request, error2) {
      this.result = { success: false, error: error2 };
      this.delegate.formSubmissionErrored(this, error2);
    }
    requestFinished(_request) {
      var _a;
      this.state = FormSubmissionState.stopped;
      (_a = this.submitter) === null || _a === void 0 ? void 0 : _a.removeAttribute("disabled");
      dispatch("turbo:submit-end", {
        target: this.formElement,
        detail: Object.assign({ formSubmission: this }, this.result)
      });
      this.delegate.formSubmissionFinished(this);
    }
    requestMustRedirect(request) {
      return !request.isIdempotent && this.mustRedirect;
    }
    requestAcceptsTurboStreamResponse(request) {
      return !request.isIdempotent || hasAttribute("data-turbo-stream", this.submitter, this.formElement);
    }
  };
  function buildFormData(formElement, submitter) {
    const formData = new FormData(formElement);
    const name = submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("name");
    const value = submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("value");
    if (name) {
      formData.append(name, value || "");
    }
    return formData;
  }
  function getCookieValue(cookieName) {
    if (cookieName != null) {
      const cookies = document.cookie ? document.cookie.split("; ") : [];
      const cookie = cookies.find((cookie2) => cookie2.startsWith(cookieName));
      if (cookie) {
        const value = cookie.split("=").slice(1).join("=");
        return value ? decodeURIComponent(value) : void 0;
      }
    }
  }
  function responseSucceededWithoutRedirect(response) {
    return response.statusCode == 200 && !response.redirected;
  }
  function mergeFormDataEntries(url, entries) {
    const searchParams = new URLSearchParams();
    for (const [name, value] of entries) {
      if (value instanceof File)
        continue;
      searchParams.append(name, value);
    }
    url.search = searchParams.toString();
    return url;
  }
  var Snapshot = class {
    constructor(element) {
      this.element = element;
    }
    get activeElement() {
      return this.element.ownerDocument.activeElement;
    }
    get children() {
      return [...this.element.children];
    }
    hasAnchor(anchor) {
      return this.getElementForAnchor(anchor) != null;
    }
    getElementForAnchor(anchor) {
      return anchor ? this.element.querySelector(`[id='${anchor}'], a[name='${anchor}']`) : null;
    }
    get isConnected() {
      return this.element.isConnected;
    }
    get firstAutofocusableElement() {
      const inertDisabledOrHidden = "[inert], :disabled, [hidden], details:not([open]), dialog:not([open])";
      for (const element of this.element.querySelectorAll("[autofocus]")) {
        if (element.closest(inertDisabledOrHidden) == null)
          return element;
        else
          continue;
      }
      return null;
    }
    get permanentElements() {
      return queryPermanentElementsAll(this.element);
    }
    getPermanentElementById(id) {
      return getPermanentElementById(this.element, id);
    }
    getPermanentElementMapForSnapshot(snapshot) {
      const permanentElementMap = {};
      for (const currentPermanentElement of this.permanentElements) {
        const { id } = currentPermanentElement;
        const newPermanentElement = snapshot.getPermanentElementById(id);
        if (newPermanentElement) {
          permanentElementMap[id] = [currentPermanentElement, newPermanentElement];
        }
      }
      return permanentElementMap;
    }
  };
  function getPermanentElementById(node, id) {
    return node.querySelector(`#${id}[data-turbo-permanent]`);
  }
  function queryPermanentElementsAll(node) {
    return node.querySelectorAll("[id][data-turbo-permanent]");
  }
  var FormSubmitObserver = class {
    constructor(delegate, eventTarget) {
      this.started = false;
      this.submitCaptured = () => {
        this.eventTarget.removeEventListener("submit", this.submitBubbled, false);
        this.eventTarget.addEventListener("submit", this.submitBubbled, false);
      };
      this.submitBubbled = (event) => {
        if (!event.defaultPrevented) {
          const form = event.target instanceof HTMLFormElement ? event.target : void 0;
          const submitter = event.submitter || void 0;
          if (form && submissionDoesNotDismissDialog(form, submitter) && submissionDoesNotTargetIFrame(form, submitter) && this.delegate.willSubmitForm(form, submitter)) {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.delegate.formSubmitted(form, submitter);
          }
        }
      };
      this.delegate = delegate;
      this.eventTarget = eventTarget;
    }
    start() {
      if (!this.started) {
        this.eventTarget.addEventListener("submit", this.submitCaptured, true);
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        this.eventTarget.removeEventListener("submit", this.submitCaptured, true);
        this.started = false;
      }
    }
  };
  function submissionDoesNotDismissDialog(form, submitter) {
    const method = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("formmethod")) || form.getAttribute("method");
    return method != "dialog";
  }
  function submissionDoesNotTargetIFrame(form, submitter) {
    if ((submitter === null || submitter === void 0 ? void 0 : submitter.hasAttribute("formtarget")) || form.hasAttribute("target")) {
      const target = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("formtarget")) || form.target;
      for (const element of document.getElementsByName(target)) {
        if (element instanceof HTMLIFrameElement)
          return false;
      }
      return true;
    } else {
      return true;
    }
  }
  var View = class {
    constructor(delegate, element) {
      this.resolveRenderPromise = (_value) => {
      };
      this.resolveInterceptionPromise = (_value) => {
      };
      this.delegate = delegate;
      this.element = element;
    }
    scrollToAnchor(anchor) {
      const element = this.snapshot.getElementForAnchor(anchor);
      if (element) {
        this.scrollToElement(element);
        this.focusElement(element);
      } else {
        this.scrollToPosition({ x: 0, y: 0 });
      }
    }
    scrollToAnchorFromLocation(location2) {
      this.scrollToAnchor(getAnchor(location2));
    }
    scrollToElement(element) {
      element.scrollIntoView();
    }
    focusElement(element) {
      if (element instanceof HTMLElement) {
        if (element.hasAttribute("tabindex")) {
          element.focus();
        } else {
          element.setAttribute("tabindex", "-1");
          element.focus();
          element.removeAttribute("tabindex");
        }
      }
    }
    scrollToPosition({ x, y }) {
      this.scrollRoot.scrollTo(x, y);
    }
    scrollToTop() {
      this.scrollToPosition({ x: 0, y: 0 });
    }
    get scrollRoot() {
      return window;
    }
    async render(renderer) {
      const { isPreview, shouldRender, newSnapshot: snapshot } = renderer;
      if (shouldRender) {
        try {
          this.renderPromise = new Promise((resolve) => this.resolveRenderPromise = resolve);
          this.renderer = renderer;
          await this.prepareToRenderSnapshot(renderer);
          const renderInterception = new Promise((resolve) => this.resolveInterceptionPromise = resolve);
          const options = { resume: this.resolveInterceptionPromise, render: this.renderer.renderElement };
          const immediateRender = this.delegate.allowsImmediateRender(snapshot, options);
          if (!immediateRender)
            await renderInterception;
          await this.renderSnapshot(renderer);
          this.delegate.viewRenderedSnapshot(snapshot, isPreview);
          this.delegate.preloadOnLoadLinksForView(this.element);
          this.finishRenderingSnapshot(renderer);
        } finally {
          delete this.renderer;
          this.resolveRenderPromise(void 0);
          delete this.renderPromise;
        }
      } else {
        this.invalidate(renderer.reloadReason);
      }
    }
    invalidate(reason) {
      this.delegate.viewInvalidated(reason);
    }
    async prepareToRenderSnapshot(renderer) {
      this.markAsPreview(renderer.isPreview);
      await renderer.prepareToRender();
    }
    markAsPreview(isPreview) {
      if (isPreview) {
        this.element.setAttribute("data-turbo-preview", "");
      } else {
        this.element.removeAttribute("data-turbo-preview");
      }
    }
    async renderSnapshot(renderer) {
      await renderer.render();
    }
    finishRenderingSnapshot(renderer) {
      renderer.finishRendering();
    }
  };
  var FrameView = class extends View {
    invalidate() {
      this.element.innerHTML = "";
    }
    get snapshot() {
      return new Snapshot(this.element);
    }
  };
  var LinkInterceptor = class {
    constructor(delegate, element) {
      this.clickBubbled = (event) => {
        if (this.respondsToEventTarget(event.target)) {
          this.clickEvent = event;
        } else {
          delete this.clickEvent;
        }
      };
      this.linkClicked = (event) => {
        if (this.clickEvent && this.respondsToEventTarget(event.target) && event.target instanceof Element) {
          if (this.delegate.shouldInterceptLinkClick(event.target, event.detail.url, event.detail.originalEvent)) {
            this.clickEvent.preventDefault();
            event.preventDefault();
            this.delegate.linkClickIntercepted(event.target, event.detail.url, event.detail.originalEvent);
          }
        }
        delete this.clickEvent;
      };
      this.willVisit = (_event) => {
        delete this.clickEvent;
      };
      this.delegate = delegate;
      this.element = element;
    }
    start() {
      this.element.addEventListener("click", this.clickBubbled);
      document.addEventListener("turbo:click", this.linkClicked);
      document.addEventListener("turbo:before-visit", this.willVisit);
    }
    stop() {
      this.element.removeEventListener("click", this.clickBubbled);
      document.removeEventListener("turbo:click", this.linkClicked);
      document.removeEventListener("turbo:before-visit", this.willVisit);
    }
    respondsToEventTarget(target) {
      const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
      return element && element.closest("turbo-frame, html") == this.element;
    }
  };
  var LinkClickObserver = class {
    constructor(delegate, eventTarget) {
      this.started = false;
      this.clickCaptured = () => {
        this.eventTarget.removeEventListener("click", this.clickBubbled, false);
        this.eventTarget.addEventListener("click", this.clickBubbled, false);
      };
      this.clickBubbled = (event) => {
        if (event instanceof MouseEvent && this.clickEventIsSignificant(event)) {
          const target = event.composedPath && event.composedPath()[0] || event.target;
          const link = this.findLinkFromClickTarget(target);
          if (link && doesNotTargetIFrame(link)) {
            const location2 = this.getLocationForLink(link);
            if (this.delegate.willFollowLinkToLocation(link, location2, event)) {
              event.preventDefault();
              this.delegate.followedLinkToLocation(link, location2);
            }
          }
        }
      };
      this.delegate = delegate;
      this.eventTarget = eventTarget;
    }
    start() {
      if (!this.started) {
        this.eventTarget.addEventListener("click", this.clickCaptured, true);
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        this.eventTarget.removeEventListener("click", this.clickCaptured, true);
        this.started = false;
      }
    }
    clickEventIsSignificant(event) {
      return !(event.target && event.target.isContentEditable || event.defaultPrevented || event.which > 1 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey);
    }
    findLinkFromClickTarget(target) {
      return findClosestRecursively(target, "a[href]:not([target^=_]):not([download])");
    }
    getLocationForLink(link) {
      return expandURL(link.getAttribute("href") || "");
    }
  };
  function doesNotTargetIFrame(anchor) {
    if (anchor.hasAttribute("target")) {
      for (const element of document.getElementsByName(anchor.target)) {
        if (element instanceof HTMLIFrameElement)
          return false;
      }
      return true;
    } else {
      return true;
    }
  }
  var FormLinkClickObserver = class {
    constructor(delegate, element) {
      this.delegate = delegate;
      this.linkInterceptor = new LinkClickObserver(this, element);
    }
    start() {
      this.linkInterceptor.start();
    }
    stop() {
      this.linkInterceptor.stop();
    }
    willFollowLinkToLocation(link, location2, originalEvent) {
      return this.delegate.willSubmitFormLinkToLocation(link, location2, originalEvent) && link.hasAttribute("data-turbo-method");
    }
    followedLinkToLocation(link, location2) {
      const form = document.createElement("form");
      const type = "hidden";
      for (const [name, value] of location2.searchParams) {
        form.append(Object.assign(document.createElement("input"), { type, name, value }));
      }
      const action = Object.assign(location2, { search: "" });
      form.setAttribute("data-turbo", "true");
      form.setAttribute("action", action.href);
      form.setAttribute("hidden", "");
      const method = link.getAttribute("data-turbo-method");
      if (method)
        form.setAttribute("method", method);
      const turboFrame = link.getAttribute("data-turbo-frame");
      if (turboFrame)
        form.setAttribute("data-turbo-frame", turboFrame);
      const turboAction = getVisitAction(link);
      if (turboAction)
        form.setAttribute("data-turbo-action", turboAction);
      const turboConfirm = link.getAttribute("data-turbo-confirm");
      if (turboConfirm)
        form.setAttribute("data-turbo-confirm", turboConfirm);
      const turboStream = link.hasAttribute("data-turbo-stream");
      if (turboStream)
        form.setAttribute("data-turbo-stream", "");
      this.delegate.submittedFormLinkToLocation(link, location2, form);
      document.body.appendChild(form);
      form.addEventListener("turbo:submit-end", () => form.remove(), { once: true });
      requestAnimationFrame(() => form.requestSubmit());
    }
  };
  var Bardo = class {
    constructor(delegate, permanentElementMap) {
      this.delegate = delegate;
      this.permanentElementMap = permanentElementMap;
    }
    static async preservingPermanentElements(delegate, permanentElementMap, callback) {
      const bardo = new this(delegate, permanentElementMap);
      bardo.enter();
      await callback();
      bardo.leave();
    }
    enter() {
      for (const id in this.permanentElementMap) {
        const [currentPermanentElement, newPermanentElement] = this.permanentElementMap[id];
        this.delegate.enteringBardo(currentPermanentElement, newPermanentElement);
        this.replaceNewPermanentElementWithPlaceholder(newPermanentElement);
      }
    }
    leave() {
      for (const id in this.permanentElementMap) {
        const [currentPermanentElement] = this.permanentElementMap[id];
        this.replaceCurrentPermanentElementWithClone(currentPermanentElement);
        this.replacePlaceholderWithPermanentElement(currentPermanentElement);
        this.delegate.leavingBardo(currentPermanentElement);
      }
    }
    replaceNewPermanentElementWithPlaceholder(permanentElement) {
      const placeholder = createPlaceholderForPermanentElement(permanentElement);
      permanentElement.replaceWith(placeholder);
    }
    replaceCurrentPermanentElementWithClone(permanentElement) {
      const clone = permanentElement.cloneNode(true);
      permanentElement.replaceWith(clone);
    }
    replacePlaceholderWithPermanentElement(permanentElement) {
      const placeholder = this.getPlaceholderById(permanentElement.id);
      placeholder === null || placeholder === void 0 ? void 0 : placeholder.replaceWith(permanentElement);
    }
    getPlaceholderById(id) {
      return this.placeholders.find((element) => element.content == id);
    }
    get placeholders() {
      return [...document.querySelectorAll("meta[name=turbo-permanent-placeholder][content]")];
    }
  };
  function createPlaceholderForPermanentElement(permanentElement) {
    const element = document.createElement("meta");
    element.setAttribute("name", "turbo-permanent-placeholder");
    element.setAttribute("content", permanentElement.id);
    return element;
  }
  var Renderer = class {
    constructor(currentSnapshot, newSnapshot, renderElement, isPreview, willRender = true) {
      this.activeElement = null;
      this.currentSnapshot = currentSnapshot;
      this.newSnapshot = newSnapshot;
      this.isPreview = isPreview;
      this.willRender = willRender;
      this.renderElement = renderElement;
      this.promise = new Promise((resolve, reject) => this.resolvingFunctions = { resolve, reject });
    }
    get shouldRender() {
      return true;
    }
    get reloadReason() {
      return;
    }
    prepareToRender() {
      return;
    }
    finishRendering() {
      if (this.resolvingFunctions) {
        this.resolvingFunctions.resolve();
        delete this.resolvingFunctions;
      }
    }
    async preservingPermanentElements(callback) {
      await Bardo.preservingPermanentElements(this, this.permanentElementMap, callback);
    }
    focusFirstAutofocusableElement() {
      const element = this.connectedSnapshot.firstAutofocusableElement;
      if (elementIsFocusable(element)) {
        element.focus();
      }
    }
    enteringBardo(currentPermanentElement) {
      if (this.activeElement)
        return;
      if (currentPermanentElement.contains(this.currentSnapshot.activeElement)) {
        this.activeElement = this.currentSnapshot.activeElement;
      }
    }
    leavingBardo(currentPermanentElement) {
      if (currentPermanentElement.contains(this.activeElement) && this.activeElement instanceof HTMLElement) {
        this.activeElement.focus();
        this.activeElement = null;
      }
    }
    get connectedSnapshot() {
      return this.newSnapshot.isConnected ? this.newSnapshot : this.currentSnapshot;
    }
    get currentElement() {
      return this.currentSnapshot.element;
    }
    get newElement() {
      return this.newSnapshot.element;
    }
    get permanentElementMap() {
      return this.currentSnapshot.getPermanentElementMapForSnapshot(this.newSnapshot);
    }
  };
  function elementIsFocusable(element) {
    return element && typeof element.focus == "function";
  }
  var FrameRenderer = class extends Renderer {
    constructor(delegate, currentSnapshot, newSnapshot, renderElement, isPreview, willRender = true) {
      super(currentSnapshot, newSnapshot, renderElement, isPreview, willRender);
      this.delegate = delegate;
    }
    static renderElement(currentElement, newElement) {
      var _a;
      const destinationRange = document.createRange();
      destinationRange.selectNodeContents(currentElement);
      destinationRange.deleteContents();
      const frameElement = newElement;
      const sourceRange = (_a = frameElement.ownerDocument) === null || _a === void 0 ? void 0 : _a.createRange();
      if (sourceRange) {
        sourceRange.selectNodeContents(frameElement);
        currentElement.appendChild(sourceRange.extractContents());
      }
    }
    get shouldRender() {
      return true;
    }
    async render() {
      await nextAnimationFrame();
      this.preservingPermanentElements(() => {
        this.loadFrameElement();
      });
      this.scrollFrameIntoView();
      await nextAnimationFrame();
      this.focusFirstAutofocusableElement();
      await nextAnimationFrame();
      this.activateScriptElements();
    }
    loadFrameElement() {
      this.delegate.willRenderFrame(this.currentElement, this.newElement);
      this.renderElement(this.currentElement, this.newElement);
    }
    scrollFrameIntoView() {
      if (this.currentElement.autoscroll || this.newElement.autoscroll) {
        const element = this.currentElement.firstElementChild;
        const block = readScrollLogicalPosition(this.currentElement.getAttribute("data-autoscroll-block"), "end");
        const behavior = readScrollBehavior(this.currentElement.getAttribute("data-autoscroll-behavior"), "auto");
        if (element) {
          element.scrollIntoView({ block, behavior });
          return true;
        }
      }
      return false;
    }
    activateScriptElements() {
      for (const inertScriptElement of this.newScriptElements) {
        const activatedScriptElement = activateScriptElement(inertScriptElement);
        inertScriptElement.replaceWith(activatedScriptElement);
      }
    }
    get newScriptElements() {
      return this.currentElement.querySelectorAll("script");
    }
  };
  function readScrollLogicalPosition(value, defaultValue) {
    if (value == "end" || value == "start" || value == "center" || value == "nearest") {
      return value;
    } else {
      return defaultValue;
    }
  }
  function readScrollBehavior(value, defaultValue) {
    if (value == "auto" || value == "smooth") {
      return value;
    } else {
      return defaultValue;
    }
  }
  var ProgressBar = class {
    constructor() {
      this.hiding = false;
      this.value = 0;
      this.visible = false;
      this.trickle = () => {
        this.setValue(this.value + Math.random() / 100);
      };
      this.stylesheetElement = this.createStylesheetElement();
      this.progressElement = this.createProgressElement();
      this.installStylesheetElement();
      this.setValue(0);
    }
    static get defaultCSS() {
      return unindent`
      .turbo-progress-bar {
        position: fixed;
        display: block;
        top: 0;
        left: 0;
        height: 3px;
        background: #0076ff;
        z-index: 2147483647;
        transition:
          width ${ProgressBar.animationDuration}ms ease-out,
          opacity ${ProgressBar.animationDuration / 2}ms ${ProgressBar.animationDuration / 2}ms ease-in;
        transform: translate3d(0, 0, 0);
      }
    `;
    }
    show() {
      if (!this.visible) {
        this.visible = true;
        this.installProgressElement();
        this.startTrickling();
      }
    }
    hide() {
      if (this.visible && !this.hiding) {
        this.hiding = true;
        this.fadeProgressElement(() => {
          this.uninstallProgressElement();
          this.stopTrickling();
          this.visible = false;
          this.hiding = false;
        });
      }
    }
    setValue(value) {
      this.value = value;
      this.refresh();
    }
    installStylesheetElement() {
      document.head.insertBefore(this.stylesheetElement, document.head.firstChild);
    }
    installProgressElement() {
      this.progressElement.style.width = "0";
      this.progressElement.style.opacity = "1";
      document.documentElement.insertBefore(this.progressElement, document.body);
      this.refresh();
    }
    fadeProgressElement(callback) {
      this.progressElement.style.opacity = "0";
      setTimeout(callback, ProgressBar.animationDuration * 1.5);
    }
    uninstallProgressElement() {
      if (this.progressElement.parentNode) {
        document.documentElement.removeChild(this.progressElement);
      }
    }
    startTrickling() {
      if (!this.trickleInterval) {
        this.trickleInterval = window.setInterval(this.trickle, ProgressBar.animationDuration);
      }
    }
    stopTrickling() {
      window.clearInterval(this.trickleInterval);
      delete this.trickleInterval;
    }
    refresh() {
      requestAnimationFrame(() => {
        this.progressElement.style.width = `${10 + this.value * 90}%`;
      });
    }
    createStylesheetElement() {
      const element = document.createElement("style");
      element.type = "text/css";
      element.textContent = ProgressBar.defaultCSS;
      if (this.cspNonce) {
        element.nonce = this.cspNonce;
      }
      return element;
    }
    createProgressElement() {
      const element = document.createElement("div");
      element.className = "turbo-progress-bar";
      return element;
    }
    get cspNonce() {
      return getMetaContent("csp-nonce");
    }
  };
  ProgressBar.animationDuration = 300;
  var HeadSnapshot = class extends Snapshot {
    constructor() {
      super(...arguments);
      this.detailsByOuterHTML = this.children.filter((element) => !elementIsNoscript(element)).map((element) => elementWithoutNonce(element)).reduce((result, element) => {
        const { outerHTML } = element;
        const details = outerHTML in result ? result[outerHTML] : {
          type: elementType(element),
          tracked: elementIsTracked(element),
          elements: []
        };
        return Object.assign(Object.assign({}, result), { [outerHTML]: Object.assign(Object.assign({}, details), { elements: [...details.elements, element] }) });
      }, {});
    }
    get trackedElementSignature() {
      return Object.keys(this.detailsByOuterHTML).filter((outerHTML) => this.detailsByOuterHTML[outerHTML].tracked).join("");
    }
    getScriptElementsNotInSnapshot(snapshot) {
      return this.getElementsMatchingTypeNotInSnapshot("script", snapshot);
    }
    getStylesheetElementsNotInSnapshot(snapshot) {
      return this.getElementsMatchingTypeNotInSnapshot("stylesheet", snapshot);
    }
    getElementsMatchingTypeNotInSnapshot(matchedType, snapshot) {
      return Object.keys(this.detailsByOuterHTML).filter((outerHTML) => !(outerHTML in snapshot.detailsByOuterHTML)).map((outerHTML) => this.detailsByOuterHTML[outerHTML]).filter(({ type }) => type == matchedType).map(({ elements: [element] }) => element);
    }
    get provisionalElements() {
      return Object.keys(this.detailsByOuterHTML).reduce((result, outerHTML) => {
        const { type, tracked, elements } = this.detailsByOuterHTML[outerHTML];
        if (type == null && !tracked) {
          return [...result, ...elements];
        } else if (elements.length > 1) {
          return [...result, ...elements.slice(1)];
        } else {
          return result;
        }
      }, []);
    }
    getMetaValue(name) {
      const element = this.findMetaElementByName(name);
      return element ? element.getAttribute("content") : null;
    }
    findMetaElementByName(name) {
      return Object.keys(this.detailsByOuterHTML).reduce((result, outerHTML) => {
        const { elements: [element] } = this.detailsByOuterHTML[outerHTML];
        return elementIsMetaElementWithName(element, name) ? element : result;
      }, void 0);
    }
  };
  function elementType(element) {
    if (elementIsScript(element)) {
      return "script";
    } else if (elementIsStylesheet(element)) {
      return "stylesheet";
    }
  }
  function elementIsTracked(element) {
    return element.getAttribute("data-turbo-track") == "reload";
  }
  function elementIsScript(element) {
    const tagName = element.localName;
    return tagName == "script";
  }
  function elementIsNoscript(element) {
    const tagName = element.localName;
    return tagName == "noscript";
  }
  function elementIsStylesheet(element) {
    const tagName = element.localName;
    return tagName == "style" || tagName == "link" && element.getAttribute("rel") == "stylesheet";
  }
  function elementIsMetaElementWithName(element, name) {
    const tagName = element.localName;
    return tagName == "meta" && element.getAttribute("name") == name;
  }
  function elementWithoutNonce(element) {
    if (element.hasAttribute("nonce")) {
      element.setAttribute("nonce", "");
    }
    return element;
  }
  var PageSnapshot = class extends Snapshot {
    constructor(element, headSnapshot) {
      super(element);
      this.headSnapshot = headSnapshot;
    }
    static fromHTMLString(html = "") {
      return this.fromDocument(parseHTMLDocument(html));
    }
    static fromElement(element) {
      return this.fromDocument(element.ownerDocument);
    }
    static fromDocument({ head, body }) {
      return new this(body, new HeadSnapshot(head));
    }
    clone() {
      const clonedElement = this.element.cloneNode(true);
      const selectElements = this.element.querySelectorAll("select");
      const clonedSelectElements = clonedElement.querySelectorAll("select");
      for (const [index, source] of selectElements.entries()) {
        const clone = clonedSelectElements[index];
        for (const option of clone.selectedOptions)
          option.selected = false;
        for (const option of source.selectedOptions)
          clone.options[option.index].selected = true;
      }
      for (const clonedPasswordInput of clonedElement.querySelectorAll('input[type="password"]')) {
        clonedPasswordInput.value = "";
      }
      return new PageSnapshot(clonedElement, this.headSnapshot);
    }
    get headElement() {
      return this.headSnapshot.element;
    }
    get rootLocation() {
      var _a;
      const root = (_a = this.getSetting("root")) !== null && _a !== void 0 ? _a : "/";
      return expandURL(root);
    }
    get cacheControlValue() {
      return this.getSetting("cache-control");
    }
    get isPreviewable() {
      return this.cacheControlValue != "no-preview";
    }
    get isCacheable() {
      return this.cacheControlValue != "no-cache";
    }
    get isVisitable() {
      return this.getSetting("visit-control") != "reload";
    }
    getSetting(name) {
      return this.headSnapshot.getMetaValue(`turbo-${name}`);
    }
  };
  var TimingMetric;
  (function(TimingMetric2) {
    TimingMetric2["visitStart"] = "visitStart";
    TimingMetric2["requestStart"] = "requestStart";
    TimingMetric2["requestEnd"] = "requestEnd";
    TimingMetric2["visitEnd"] = "visitEnd";
  })(TimingMetric || (TimingMetric = {}));
  var VisitState;
  (function(VisitState2) {
    VisitState2["initialized"] = "initialized";
    VisitState2["started"] = "started";
    VisitState2["canceled"] = "canceled";
    VisitState2["failed"] = "failed";
    VisitState2["completed"] = "completed";
  })(VisitState || (VisitState = {}));
  var defaultOptions = {
    action: "advance",
    historyChanged: false,
    visitCachedSnapshot: () => {
    },
    willRender: true,
    updateHistory: true,
    shouldCacheSnapshot: true,
    acceptsStreamResponse: false
  };
  var SystemStatusCode;
  (function(SystemStatusCode2) {
    SystemStatusCode2[SystemStatusCode2["networkFailure"] = 0] = "networkFailure";
    SystemStatusCode2[SystemStatusCode2["timeoutFailure"] = -1] = "timeoutFailure";
    SystemStatusCode2[SystemStatusCode2["contentTypeMismatch"] = -2] = "contentTypeMismatch";
  })(SystemStatusCode || (SystemStatusCode = {}));
  var Visit = class {
    constructor(delegate, location2, restorationIdentifier, options = {}) {
      this.identifier = uuid();
      this.timingMetrics = {};
      this.followedRedirect = false;
      this.historyChanged = false;
      this.scrolled = false;
      this.shouldCacheSnapshot = true;
      this.acceptsStreamResponse = false;
      this.snapshotCached = false;
      this.state = VisitState.initialized;
      this.delegate = delegate;
      this.location = location2;
      this.restorationIdentifier = restorationIdentifier || uuid();
      const { action, historyChanged, referrer, snapshot, snapshotHTML, response, visitCachedSnapshot, willRender, updateHistory, shouldCacheSnapshot, acceptsStreamResponse } = Object.assign(Object.assign({}, defaultOptions), options);
      this.action = action;
      this.historyChanged = historyChanged;
      this.referrer = referrer;
      this.snapshot = snapshot;
      this.snapshotHTML = snapshotHTML;
      this.response = response;
      this.isSamePage = this.delegate.locationWithActionIsSamePage(this.location, this.action);
      this.visitCachedSnapshot = visitCachedSnapshot;
      this.willRender = willRender;
      this.updateHistory = updateHistory;
      this.scrolled = !willRender;
      this.shouldCacheSnapshot = shouldCacheSnapshot;
      this.acceptsStreamResponse = acceptsStreamResponse;
    }
    get adapter() {
      return this.delegate.adapter;
    }
    get view() {
      return this.delegate.view;
    }
    get history() {
      return this.delegate.history;
    }
    get restorationData() {
      return this.history.getRestorationDataForIdentifier(this.restorationIdentifier);
    }
    get silent() {
      return this.isSamePage;
    }
    start() {
      if (this.state == VisitState.initialized) {
        this.recordTimingMetric(TimingMetric.visitStart);
        this.state = VisitState.started;
        this.adapter.visitStarted(this);
        this.delegate.visitStarted(this);
      }
    }
    cancel() {
      if (this.state == VisitState.started) {
        if (this.request) {
          this.request.cancel();
        }
        this.cancelRender();
        this.state = VisitState.canceled;
      }
    }
    complete() {
      if (this.state == VisitState.started) {
        this.recordTimingMetric(TimingMetric.visitEnd);
        this.state = VisitState.completed;
        this.followRedirect();
        if (!this.followedRedirect) {
          this.adapter.visitCompleted(this);
          this.delegate.visitCompleted(this);
        }
      }
    }
    fail() {
      if (this.state == VisitState.started) {
        this.state = VisitState.failed;
        this.adapter.visitFailed(this);
      }
    }
    changeHistory() {
      var _a;
      if (!this.historyChanged && this.updateHistory) {
        const actionForHistory = this.location.href === ((_a = this.referrer) === null || _a === void 0 ? void 0 : _a.href) ? "replace" : this.action;
        const method = getHistoryMethodForAction(actionForHistory);
        this.history.update(method, this.location, this.restorationIdentifier);
        this.historyChanged = true;
      }
    }
    issueRequest() {
      if (this.hasPreloadedResponse()) {
        this.simulateRequest();
      } else if (this.shouldIssueRequest() && !this.request) {
        this.request = new FetchRequest(this, FetchMethod.get, this.location);
        this.request.perform();
      }
    }
    simulateRequest() {
      if (this.response) {
        this.startRequest();
        this.recordResponse();
        this.finishRequest();
      }
    }
    startRequest() {
      this.recordTimingMetric(TimingMetric.requestStart);
      this.adapter.visitRequestStarted(this);
    }
    recordResponse(response = this.response) {
      this.response = response;
      if (response) {
        const { statusCode } = response;
        if (isSuccessful(statusCode)) {
          this.adapter.visitRequestCompleted(this);
        } else {
          this.adapter.visitRequestFailedWithStatusCode(this, statusCode);
        }
      }
    }
    finishRequest() {
      this.recordTimingMetric(TimingMetric.requestEnd);
      this.adapter.visitRequestFinished(this);
    }
    loadResponse() {
      if (this.response) {
        const { statusCode, responseHTML } = this.response;
        this.render(async () => {
          if (this.shouldCacheSnapshot)
            this.cacheSnapshot();
          if (this.view.renderPromise)
            await this.view.renderPromise;
          if (isSuccessful(statusCode) && responseHTML != null) {
            await this.view.renderPage(PageSnapshot.fromHTMLString(responseHTML), false, this.willRender, this);
            this.performScroll();
            this.adapter.visitRendered(this);
            this.complete();
          } else {
            await this.view.renderError(PageSnapshot.fromHTMLString(responseHTML), this);
            this.adapter.visitRendered(this);
            this.fail();
          }
        });
      }
    }
    getCachedSnapshot() {
      const snapshot = this.view.getCachedSnapshotForLocation(this.location) || this.getPreloadedSnapshot();
      if (snapshot && (!getAnchor(this.location) || snapshot.hasAnchor(getAnchor(this.location)))) {
        if (this.action == "restore" || snapshot.isPreviewable) {
          return snapshot;
        }
      }
    }
    getPreloadedSnapshot() {
      if (this.snapshotHTML) {
        return PageSnapshot.fromHTMLString(this.snapshotHTML);
      }
    }
    hasCachedSnapshot() {
      return this.getCachedSnapshot() != null;
    }
    loadCachedSnapshot() {
      const snapshot = this.getCachedSnapshot();
      if (snapshot) {
        const isPreview = this.shouldIssueRequest();
        this.render(async () => {
          this.cacheSnapshot();
          if (this.isSamePage) {
            this.adapter.visitRendered(this);
          } else {
            if (this.view.renderPromise)
              await this.view.renderPromise;
            await this.view.renderPage(snapshot, isPreview, this.willRender, this);
            this.performScroll();
            this.adapter.visitRendered(this);
            if (!isPreview) {
              this.complete();
            }
          }
        });
      }
    }
    followRedirect() {
      var _a;
      if (this.redirectedToLocation && !this.followedRedirect && ((_a = this.response) === null || _a === void 0 ? void 0 : _a.redirected)) {
        this.adapter.visitProposedToLocation(this.redirectedToLocation, {
          action: "replace",
          response: this.response,
          shouldCacheSnapshot: false,
          willRender: false
        });
        this.followedRedirect = true;
      }
    }
    goToSamePageAnchor() {
      if (this.isSamePage) {
        this.render(async () => {
          this.cacheSnapshot();
          this.performScroll();
          this.changeHistory();
          this.adapter.visitRendered(this);
        });
      }
    }
    prepareRequest(request) {
      if (this.acceptsStreamResponse) {
        request.acceptResponseType(StreamMessage.contentType);
      }
    }
    requestStarted() {
      this.startRequest();
    }
    requestPreventedHandlingResponse(_request, _response) {
    }
    async requestSucceededWithResponse(request, response) {
      const responseHTML = await response.responseHTML;
      const { redirected, statusCode } = response;
      if (responseHTML == void 0) {
        this.recordResponse({
          statusCode: SystemStatusCode.contentTypeMismatch,
          redirected
        });
      } else {
        this.redirectedToLocation = response.redirected ? response.location : void 0;
        this.recordResponse({ statusCode, responseHTML, redirected });
      }
    }
    async requestFailedWithResponse(request, response) {
      const responseHTML = await response.responseHTML;
      const { redirected, statusCode } = response;
      if (responseHTML == void 0) {
        this.recordResponse({
          statusCode: SystemStatusCode.contentTypeMismatch,
          redirected
        });
      } else {
        this.recordResponse({ statusCode, responseHTML, redirected });
      }
    }
    requestErrored(_request, _error) {
      this.recordResponse({
        statusCode: SystemStatusCode.networkFailure,
        redirected: false
      });
    }
    requestFinished() {
      this.finishRequest();
    }
    performScroll() {
      if (!this.scrolled && !this.view.forceReloaded) {
        if (this.action == "restore") {
          this.scrollToRestoredPosition() || this.scrollToAnchor() || this.view.scrollToTop();
        } else {
          this.scrollToAnchor() || this.view.scrollToTop();
        }
        if (this.isSamePage) {
          this.delegate.visitScrolledToSamePageLocation(this.view.lastRenderedLocation, this.location);
        }
        this.scrolled = true;
      }
    }
    scrollToRestoredPosition() {
      const { scrollPosition } = this.restorationData;
      if (scrollPosition) {
        this.view.scrollToPosition(scrollPosition);
        return true;
      }
    }
    scrollToAnchor() {
      const anchor = getAnchor(this.location);
      if (anchor != null) {
        this.view.scrollToAnchor(anchor);
        return true;
      }
    }
    recordTimingMetric(metric) {
      this.timingMetrics[metric] = (/* @__PURE__ */ new Date()).getTime();
    }
    getTimingMetrics() {
      return Object.assign({}, this.timingMetrics);
    }
    getHistoryMethodForAction(action) {
      switch (action) {
        case "replace":
          return history.replaceState;
        case "advance":
        case "restore":
          return history.pushState;
      }
    }
    hasPreloadedResponse() {
      return typeof this.response == "object";
    }
    shouldIssueRequest() {
      if (this.isSamePage) {
        return false;
      } else if (this.action == "restore") {
        return !this.hasCachedSnapshot();
      } else {
        return this.willRender;
      }
    }
    cacheSnapshot() {
      if (!this.snapshotCached) {
        this.view.cacheSnapshot(this.snapshot).then((snapshot) => snapshot && this.visitCachedSnapshot(snapshot));
        this.snapshotCached = true;
      }
    }
    async render(callback) {
      this.cancelRender();
      await new Promise((resolve) => {
        this.frame = requestAnimationFrame(() => resolve());
      });
      await callback();
      delete this.frame;
    }
    cancelRender() {
      if (this.frame) {
        cancelAnimationFrame(this.frame);
        delete this.frame;
      }
    }
  };
  function isSuccessful(statusCode) {
    return statusCode >= 200 && statusCode < 300;
  }
  var BrowserAdapter = class {
    constructor(session2) {
      this.progressBar = new ProgressBar();
      this.showProgressBar = () => {
        this.progressBar.show();
      };
      this.session = session2;
    }
    visitProposedToLocation(location2, options) {
      this.navigator.startVisit(location2, (options === null || options === void 0 ? void 0 : options.restorationIdentifier) || uuid(), options);
    }
    visitStarted(visit2) {
      this.location = visit2.location;
      visit2.loadCachedSnapshot();
      visit2.issueRequest();
      visit2.goToSamePageAnchor();
    }
    visitRequestStarted(visit2) {
      this.progressBar.setValue(0);
      if (visit2.hasCachedSnapshot() || visit2.action != "restore") {
        this.showVisitProgressBarAfterDelay();
      } else {
        this.showProgressBar();
      }
    }
    visitRequestCompleted(visit2) {
      visit2.loadResponse();
    }
    visitRequestFailedWithStatusCode(visit2, statusCode) {
      switch (statusCode) {
        case SystemStatusCode.networkFailure:
        case SystemStatusCode.timeoutFailure:
        case SystemStatusCode.contentTypeMismatch:
          return this.reload({
            reason: "request_failed",
            context: {
              statusCode
            }
          });
        default:
          return visit2.loadResponse();
      }
    }
    visitRequestFinished(_visit) {
      this.progressBar.setValue(1);
      this.hideVisitProgressBar();
    }
    visitCompleted(_visit) {
    }
    pageInvalidated(reason) {
      this.reload(reason);
    }
    visitFailed(_visit) {
    }
    visitRendered(_visit) {
    }
    formSubmissionStarted(_formSubmission) {
      this.progressBar.setValue(0);
      this.showFormProgressBarAfterDelay();
    }
    formSubmissionFinished(_formSubmission) {
      this.progressBar.setValue(1);
      this.hideFormProgressBar();
    }
    showVisitProgressBarAfterDelay() {
      this.visitProgressBarTimeout = window.setTimeout(this.showProgressBar, this.session.progressBarDelay);
    }
    hideVisitProgressBar() {
      this.progressBar.hide();
      if (this.visitProgressBarTimeout != null) {
        window.clearTimeout(this.visitProgressBarTimeout);
        delete this.visitProgressBarTimeout;
      }
    }
    showFormProgressBarAfterDelay() {
      if (this.formProgressBarTimeout == null) {
        this.formProgressBarTimeout = window.setTimeout(this.showProgressBar, this.session.progressBarDelay);
      }
    }
    hideFormProgressBar() {
      this.progressBar.hide();
      if (this.formProgressBarTimeout != null) {
        window.clearTimeout(this.formProgressBarTimeout);
        delete this.formProgressBarTimeout;
      }
    }
    reload(reason) {
      var _a;
      dispatch("turbo:reload", { detail: reason });
      window.location.href = ((_a = this.location) === null || _a === void 0 ? void 0 : _a.toString()) || window.location.href;
    }
    get navigator() {
      return this.session.navigator;
    }
  };
  var CacheObserver = class {
    constructor() {
      this.started = false;
      this.removeStaleElements = (_event) => {
        const staleElements = [...document.querySelectorAll('[data-turbo-cache="false"]')];
        for (const element of staleElements) {
          element.remove();
        }
      };
    }
    start() {
      if (!this.started) {
        this.started = true;
        addEventListener("turbo:before-cache", this.removeStaleElements, false);
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        removeEventListener("turbo:before-cache", this.removeStaleElements, false);
      }
    }
  };
  var FrameRedirector = class {
    constructor(session2, element) {
      this.session = session2;
      this.element = element;
      this.linkInterceptor = new LinkInterceptor(this, element);
      this.formSubmitObserver = new FormSubmitObserver(this, element);
    }
    start() {
      this.linkInterceptor.start();
      this.formSubmitObserver.start();
    }
    stop() {
      this.linkInterceptor.stop();
      this.formSubmitObserver.stop();
    }
    shouldInterceptLinkClick(element, _location, _event) {
      return this.shouldRedirect(element);
    }
    linkClickIntercepted(element, url, event) {
      const frame = this.findFrameElement(element);
      if (frame) {
        frame.delegate.linkClickIntercepted(element, url, event);
      }
    }
    willSubmitForm(element, submitter) {
      return element.closest("turbo-frame") == null && this.shouldSubmit(element, submitter) && this.shouldRedirect(element, submitter);
    }
    formSubmitted(element, submitter) {
      const frame = this.findFrameElement(element, submitter);
      if (frame) {
        frame.delegate.formSubmitted(element, submitter);
      }
    }
    shouldSubmit(form, submitter) {
      var _a;
      const action = getAction(form, submitter);
      const meta = this.element.ownerDocument.querySelector(`meta[name="turbo-root"]`);
      const rootLocation = expandURL((_a = meta === null || meta === void 0 ? void 0 : meta.content) !== null && _a !== void 0 ? _a : "/");
      return this.shouldRedirect(form, submitter) && locationIsVisitable(action, rootLocation);
    }
    shouldRedirect(element, submitter) {
      const isNavigatable = element instanceof HTMLFormElement ? this.session.submissionIsNavigatable(element, submitter) : this.session.elementIsNavigatable(element);
      if (isNavigatable) {
        const frame = this.findFrameElement(element, submitter);
        return frame ? frame != element.closest("turbo-frame") : false;
      } else {
        return false;
      }
    }
    findFrameElement(element, submitter) {
      const id = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("data-turbo-frame")) || element.getAttribute("data-turbo-frame");
      if (id && id != "_top") {
        const frame = this.element.querySelector(`#${id}:not([disabled])`);
        if (frame instanceof FrameElement) {
          return frame;
        }
      }
    }
  };
  var History = class {
    constructor(delegate) {
      this.restorationIdentifier = uuid();
      this.restorationData = {};
      this.started = false;
      this.pageLoaded = false;
      this.onPopState = (event) => {
        if (this.shouldHandlePopState()) {
          const { turbo } = event.state || {};
          if (turbo) {
            this.location = new URL(window.location.href);
            const { restorationIdentifier } = turbo;
            this.restorationIdentifier = restorationIdentifier;
            this.delegate.historyPoppedToLocationWithRestorationIdentifier(this.location, restorationIdentifier);
          }
        }
      };
      this.onPageLoad = async (_event) => {
        await nextMicrotask();
        this.pageLoaded = true;
      };
      this.delegate = delegate;
    }
    start() {
      if (!this.started) {
        addEventListener("popstate", this.onPopState, false);
        addEventListener("load", this.onPageLoad, false);
        this.started = true;
        this.replace(new URL(window.location.href));
      }
    }
    stop() {
      if (this.started) {
        removeEventListener("popstate", this.onPopState, false);
        removeEventListener("load", this.onPageLoad, false);
        this.started = false;
      }
    }
    push(location2, restorationIdentifier) {
      this.update(history.pushState, location2, restorationIdentifier);
    }
    replace(location2, restorationIdentifier) {
      this.update(history.replaceState, location2, restorationIdentifier);
    }
    update(method, location2, restorationIdentifier = uuid()) {
      const state = { turbo: { restorationIdentifier } };
      method.call(history, state, "", location2.href);
      this.location = location2;
      this.restorationIdentifier = restorationIdentifier;
    }
    getRestorationDataForIdentifier(restorationIdentifier) {
      return this.restorationData[restorationIdentifier] || {};
    }
    updateRestorationData(additionalData) {
      const { restorationIdentifier } = this;
      const restorationData = this.restorationData[restorationIdentifier];
      this.restorationData[restorationIdentifier] = Object.assign(Object.assign({}, restorationData), additionalData);
    }
    assumeControlOfScrollRestoration() {
      var _a;
      if (!this.previousScrollRestoration) {
        this.previousScrollRestoration = (_a = history.scrollRestoration) !== null && _a !== void 0 ? _a : "auto";
        history.scrollRestoration = "manual";
      }
    }
    relinquishControlOfScrollRestoration() {
      if (this.previousScrollRestoration) {
        history.scrollRestoration = this.previousScrollRestoration;
        delete this.previousScrollRestoration;
      }
    }
    shouldHandlePopState() {
      return this.pageIsLoaded();
    }
    pageIsLoaded() {
      return this.pageLoaded || document.readyState == "complete";
    }
  };
  var Navigator = class {
    constructor(delegate) {
      this.delegate = delegate;
    }
    proposeVisit(location2, options = {}) {
      if (this.delegate.allowsVisitingLocationWithAction(location2, options.action)) {
        if (locationIsVisitable(location2, this.view.snapshot.rootLocation)) {
          this.delegate.visitProposedToLocation(location2, options);
        } else {
          window.location.href = location2.toString();
        }
      }
    }
    startVisit(locatable, restorationIdentifier, options = {}) {
      this.stop();
      this.currentVisit = new Visit(this, expandURL(locatable), restorationIdentifier, Object.assign({ referrer: this.location }, options));
      this.currentVisit.start();
    }
    submitForm(form, submitter) {
      this.stop();
      this.formSubmission = new FormSubmission(this, form, submitter, true);
      this.formSubmission.start();
    }
    stop() {
      if (this.formSubmission) {
        this.formSubmission.stop();
        delete this.formSubmission;
      }
      if (this.currentVisit) {
        this.currentVisit.cancel();
        delete this.currentVisit;
      }
    }
    get adapter() {
      return this.delegate.adapter;
    }
    get view() {
      return this.delegate.view;
    }
    get history() {
      return this.delegate.history;
    }
    formSubmissionStarted(formSubmission) {
      if (typeof this.adapter.formSubmissionStarted === "function") {
        this.adapter.formSubmissionStarted(formSubmission);
      }
    }
    async formSubmissionSucceededWithResponse(formSubmission, fetchResponse) {
      if (formSubmission == this.formSubmission) {
        const responseHTML = await fetchResponse.responseHTML;
        if (responseHTML) {
          const shouldCacheSnapshot = formSubmission.method == FetchMethod.get;
          if (!shouldCacheSnapshot) {
            this.view.clearSnapshotCache();
          }
          const { statusCode, redirected } = fetchResponse;
          const action = this.getActionForFormSubmission(formSubmission);
          const visitOptions = {
            action,
            shouldCacheSnapshot,
            response: { statusCode, responseHTML, redirected }
          };
          this.proposeVisit(fetchResponse.location, visitOptions);
        }
      }
    }
    async formSubmissionFailedWithResponse(formSubmission, fetchResponse) {
      const responseHTML = await fetchResponse.responseHTML;
      if (responseHTML) {
        const snapshot = PageSnapshot.fromHTMLString(responseHTML);
        if (fetchResponse.serverError) {
          await this.view.renderError(snapshot, this.currentVisit);
        } else {
          await this.view.renderPage(snapshot, false, true, this.currentVisit);
        }
        this.view.scrollToTop();
        this.view.clearSnapshotCache();
      }
    }
    formSubmissionErrored(formSubmission, error2) {
      console.error(error2);
    }
    formSubmissionFinished(formSubmission) {
      if (typeof this.adapter.formSubmissionFinished === "function") {
        this.adapter.formSubmissionFinished(formSubmission);
      }
    }
    visitStarted(visit2) {
      this.delegate.visitStarted(visit2);
    }
    visitCompleted(visit2) {
      this.delegate.visitCompleted(visit2);
    }
    locationWithActionIsSamePage(location2, action) {
      const anchor = getAnchor(location2);
      const currentAnchor = getAnchor(this.view.lastRenderedLocation);
      const isRestorationToTop = action === "restore" && typeof anchor === "undefined";
      return action !== "replace" && getRequestURL(location2) === getRequestURL(this.view.lastRenderedLocation) && (isRestorationToTop || anchor != null && anchor !== currentAnchor);
    }
    visitScrolledToSamePageLocation(oldURL, newURL) {
      this.delegate.visitScrolledToSamePageLocation(oldURL, newURL);
    }
    get location() {
      return this.history.location;
    }
    get restorationIdentifier() {
      return this.history.restorationIdentifier;
    }
    getActionForFormSubmission({ submitter, formElement }) {
      return getVisitAction(submitter, formElement) || "advance";
    }
  };
  var PageStage;
  (function(PageStage2) {
    PageStage2[PageStage2["initial"] = 0] = "initial";
    PageStage2[PageStage2["loading"] = 1] = "loading";
    PageStage2[PageStage2["interactive"] = 2] = "interactive";
    PageStage2[PageStage2["complete"] = 3] = "complete";
  })(PageStage || (PageStage = {}));
  var PageObserver = class {
    constructor(delegate) {
      this.stage = PageStage.initial;
      this.started = false;
      this.interpretReadyState = () => {
        const { readyState } = this;
        if (readyState == "interactive") {
          this.pageIsInteractive();
        } else if (readyState == "complete") {
          this.pageIsComplete();
        }
      };
      this.pageWillUnload = () => {
        this.delegate.pageWillUnload();
      };
      this.delegate = delegate;
    }
    start() {
      if (!this.started) {
        if (this.stage == PageStage.initial) {
          this.stage = PageStage.loading;
        }
        document.addEventListener("readystatechange", this.interpretReadyState, false);
        addEventListener("pagehide", this.pageWillUnload, false);
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        document.removeEventListener("readystatechange", this.interpretReadyState, false);
        removeEventListener("pagehide", this.pageWillUnload, false);
        this.started = false;
      }
    }
    pageIsInteractive() {
      if (this.stage == PageStage.loading) {
        this.stage = PageStage.interactive;
        this.delegate.pageBecameInteractive();
      }
    }
    pageIsComplete() {
      this.pageIsInteractive();
      if (this.stage == PageStage.interactive) {
        this.stage = PageStage.complete;
        this.delegate.pageLoaded();
      }
    }
    get readyState() {
      return document.readyState;
    }
  };
  var ScrollObserver = class {
    constructor(delegate) {
      this.started = false;
      this.onScroll = () => {
        this.updatePosition({ x: window.pageXOffset, y: window.pageYOffset });
      };
      this.delegate = delegate;
    }
    start() {
      if (!this.started) {
        addEventListener("scroll", this.onScroll, false);
        this.onScroll();
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        removeEventListener("scroll", this.onScroll, false);
        this.started = false;
      }
    }
    updatePosition(position) {
      this.delegate.scrollPositionChanged(position);
    }
  };
  var StreamMessageRenderer = class {
    render({ fragment }) {
      Bardo.preservingPermanentElements(this, getPermanentElementMapForFragment(fragment), () => document.documentElement.appendChild(fragment));
    }
    enteringBardo(currentPermanentElement, newPermanentElement) {
      newPermanentElement.replaceWith(currentPermanentElement.cloneNode(true));
    }
    leavingBardo() {
    }
  };
  function getPermanentElementMapForFragment(fragment) {
    const permanentElementsInDocument = queryPermanentElementsAll(document.documentElement);
    const permanentElementMap = {};
    for (const permanentElementInDocument of permanentElementsInDocument) {
      const { id } = permanentElementInDocument;
      for (const streamElement of fragment.querySelectorAll("turbo-stream")) {
        const elementInStream = getPermanentElementById(streamElement.templateElement.content, id);
        if (elementInStream) {
          permanentElementMap[id] = [permanentElementInDocument, elementInStream];
        }
      }
    }
    return permanentElementMap;
  }
  var StreamObserver = class {
    constructor(delegate) {
      this.sources = /* @__PURE__ */ new Set();
      this.started = false;
      this.inspectFetchResponse = (event) => {
        const response = fetchResponseFromEvent(event);
        if (response && fetchResponseIsStream(response)) {
          event.preventDefault();
          this.receiveMessageResponse(response);
        }
      };
      this.receiveMessageEvent = (event) => {
        if (this.started && typeof event.data == "string") {
          this.receiveMessageHTML(event.data);
        }
      };
      this.delegate = delegate;
    }
    start() {
      if (!this.started) {
        this.started = true;
        addEventListener("turbo:before-fetch-response", this.inspectFetchResponse, false);
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        removeEventListener("turbo:before-fetch-response", this.inspectFetchResponse, false);
      }
    }
    connectStreamSource(source) {
      if (!this.streamSourceIsConnected(source)) {
        this.sources.add(source);
        source.addEventListener("message", this.receiveMessageEvent, false);
      }
    }
    disconnectStreamSource(source) {
      if (this.streamSourceIsConnected(source)) {
        this.sources.delete(source);
        source.removeEventListener("message", this.receiveMessageEvent, false);
      }
    }
    streamSourceIsConnected(source) {
      return this.sources.has(source);
    }
    async receiveMessageResponse(response) {
      const html = await response.responseHTML;
      if (html) {
        this.receiveMessageHTML(html);
      }
    }
    receiveMessageHTML(html) {
      this.delegate.receivedMessageFromStream(StreamMessage.wrap(html));
    }
  };
  function fetchResponseFromEvent(event) {
    var _a;
    const fetchResponse = (_a = event.detail) === null || _a === void 0 ? void 0 : _a.fetchResponse;
    if (fetchResponse instanceof FetchResponse) {
      return fetchResponse;
    }
  }
  function fetchResponseIsStream(response) {
    var _a;
    const contentType = (_a = response.contentType) !== null && _a !== void 0 ? _a : "";
    return contentType.startsWith(StreamMessage.contentType);
  }
  var ErrorRenderer = class extends Renderer {
    static renderElement(currentElement, newElement) {
      const { documentElement, body } = document;
      documentElement.replaceChild(newElement, body);
    }
    async render() {
      this.replaceHeadAndBody();
      this.activateScriptElements();
    }
    replaceHeadAndBody() {
      const { documentElement, head } = document;
      documentElement.replaceChild(this.newHead, head);
      this.renderElement(this.currentElement, this.newElement);
    }
    activateScriptElements() {
      for (const replaceableElement of this.scriptElements) {
        const parentNode = replaceableElement.parentNode;
        if (parentNode) {
          const element = activateScriptElement(replaceableElement);
          parentNode.replaceChild(element, replaceableElement);
        }
      }
    }
    get newHead() {
      return this.newSnapshot.headSnapshot.element;
    }
    get scriptElements() {
      return document.documentElement.querySelectorAll("script");
    }
  };
  var PageRenderer = class extends Renderer {
    static renderElement(currentElement, newElement) {
      if (document.body && newElement instanceof HTMLBodyElement) {
        document.body.replaceWith(newElement);
      } else {
        document.documentElement.appendChild(newElement);
      }
    }
    get shouldRender() {
      return this.newSnapshot.isVisitable && this.trackedElementsAreIdentical;
    }
    get reloadReason() {
      if (!this.newSnapshot.isVisitable) {
        return {
          reason: "turbo_visit_control_is_reload"
        };
      }
      if (!this.trackedElementsAreIdentical) {
        return {
          reason: "tracked_element_mismatch"
        };
      }
    }
    async prepareToRender() {
      await this.mergeHead();
    }
    async render() {
      if (this.willRender) {
        await this.replaceBody();
      }
    }
    finishRendering() {
      super.finishRendering();
      if (!this.isPreview) {
        this.focusFirstAutofocusableElement();
      }
    }
    get currentHeadSnapshot() {
      return this.currentSnapshot.headSnapshot;
    }
    get newHeadSnapshot() {
      return this.newSnapshot.headSnapshot;
    }
    get newElement() {
      return this.newSnapshot.element;
    }
    async mergeHead() {
      const mergedHeadElements = this.mergeProvisionalElements();
      const newStylesheetElements = this.copyNewHeadStylesheetElements();
      this.copyNewHeadScriptElements();
      await mergedHeadElements;
      await newStylesheetElements;
    }
    async replaceBody() {
      await this.preservingPermanentElements(async () => {
        this.activateNewBody();
        await this.assignNewBody();
      });
    }
    get trackedElementsAreIdentical() {
      return this.currentHeadSnapshot.trackedElementSignature == this.newHeadSnapshot.trackedElementSignature;
    }
    async copyNewHeadStylesheetElements() {
      const loadingElements = [];
      for (const element of this.newHeadStylesheetElements) {
        loadingElements.push(waitForLoad(element));
        document.head.appendChild(element);
      }
      await Promise.all(loadingElements);
    }
    copyNewHeadScriptElements() {
      for (const element of this.newHeadScriptElements) {
        document.head.appendChild(activateScriptElement(element));
      }
    }
    async mergeProvisionalElements() {
      const newHeadElements = [...this.newHeadProvisionalElements];
      for (const element of this.currentHeadProvisionalElements) {
        if (!this.isCurrentElementInElementList(element, newHeadElements)) {
          document.head.removeChild(element);
        }
      }
      for (const element of newHeadElements) {
        document.head.appendChild(element);
      }
    }
    isCurrentElementInElementList(element, elementList) {
      for (const [index, newElement] of elementList.entries()) {
        if (element.tagName == "TITLE") {
          if (newElement.tagName != "TITLE") {
            continue;
          }
          if (element.innerHTML == newElement.innerHTML) {
            elementList.splice(index, 1);
            return true;
          }
        }
        if (newElement.isEqualNode(element)) {
          elementList.splice(index, 1);
          return true;
        }
      }
      return false;
    }
    removeCurrentHeadProvisionalElements() {
      for (const element of this.currentHeadProvisionalElements) {
        document.head.removeChild(element);
      }
    }
    copyNewHeadProvisionalElements() {
      for (const element of this.newHeadProvisionalElements) {
        document.head.appendChild(element);
      }
    }
    activateNewBody() {
      document.adoptNode(this.newElement);
      this.activateNewBodyScriptElements();
    }
    activateNewBodyScriptElements() {
      for (const inertScriptElement of this.newBodyScriptElements) {
        const activatedScriptElement = activateScriptElement(inertScriptElement);
        inertScriptElement.replaceWith(activatedScriptElement);
      }
    }
    async assignNewBody() {
      await this.renderElement(this.currentElement, this.newElement);
    }
    get newHeadStylesheetElements() {
      return this.newHeadSnapshot.getStylesheetElementsNotInSnapshot(this.currentHeadSnapshot);
    }
    get newHeadScriptElements() {
      return this.newHeadSnapshot.getScriptElementsNotInSnapshot(this.currentHeadSnapshot);
    }
    get currentHeadProvisionalElements() {
      return this.currentHeadSnapshot.provisionalElements;
    }
    get newHeadProvisionalElements() {
      return this.newHeadSnapshot.provisionalElements;
    }
    get newBodyScriptElements() {
      return this.newElement.querySelectorAll("script");
    }
  };
  var SnapshotCache = class {
    constructor(size) {
      this.keys = [];
      this.snapshots = {};
      this.size = size;
    }
    has(location2) {
      return toCacheKey(location2) in this.snapshots;
    }
    get(location2) {
      if (this.has(location2)) {
        const snapshot = this.read(location2);
        this.touch(location2);
        return snapshot;
      }
    }
    put(location2, snapshot) {
      this.write(location2, snapshot);
      this.touch(location2);
      return snapshot;
    }
    clear() {
      this.snapshots = {};
    }
    read(location2) {
      return this.snapshots[toCacheKey(location2)];
    }
    write(location2, snapshot) {
      this.snapshots[toCacheKey(location2)] = snapshot;
    }
    touch(location2) {
      const key = toCacheKey(location2);
      const index = this.keys.indexOf(key);
      if (index > -1)
        this.keys.splice(index, 1);
      this.keys.unshift(key);
      this.trim();
    }
    trim() {
      for (const key of this.keys.splice(this.size)) {
        delete this.snapshots[key];
      }
    }
  };
  var PageView = class extends View {
    constructor() {
      super(...arguments);
      this.snapshotCache = new SnapshotCache(10);
      this.lastRenderedLocation = new URL(location.href);
      this.forceReloaded = false;
    }
    renderPage(snapshot, isPreview = false, willRender = true, visit2) {
      const renderer = new PageRenderer(this.snapshot, snapshot, PageRenderer.renderElement, isPreview, willRender);
      if (!renderer.shouldRender) {
        this.forceReloaded = true;
      } else {
        visit2 === null || visit2 === void 0 ? void 0 : visit2.changeHistory();
      }
      return this.render(renderer);
    }
    renderError(snapshot, visit2) {
      visit2 === null || visit2 === void 0 ? void 0 : visit2.changeHistory();
      const renderer = new ErrorRenderer(this.snapshot, snapshot, ErrorRenderer.renderElement, false);
      return this.render(renderer);
    }
    clearSnapshotCache() {
      this.snapshotCache.clear();
    }
    async cacheSnapshot(snapshot = this.snapshot) {
      if (snapshot.isCacheable) {
        this.delegate.viewWillCacheSnapshot();
        const { lastRenderedLocation: location2 } = this;
        await nextEventLoopTick();
        const cachedSnapshot = snapshot.clone();
        this.snapshotCache.put(location2, cachedSnapshot);
        return cachedSnapshot;
      }
    }
    getCachedSnapshotForLocation(location2) {
      return this.snapshotCache.get(location2);
    }
    get snapshot() {
      return PageSnapshot.fromElement(this.element);
    }
  };
  var Preloader = class {
    constructor(delegate) {
      this.selector = "a[data-turbo-preload]";
      this.delegate = delegate;
    }
    get snapshotCache() {
      return this.delegate.navigator.view.snapshotCache;
    }
    start() {
      if (document.readyState === "loading") {
        return document.addEventListener("DOMContentLoaded", () => {
          this.preloadOnLoadLinksForView(document.body);
        });
      } else {
        this.preloadOnLoadLinksForView(document.body);
      }
    }
    preloadOnLoadLinksForView(element) {
      for (const link of element.querySelectorAll(this.selector)) {
        this.preloadURL(link);
      }
    }
    async preloadURL(link) {
      const location2 = new URL(link.href);
      if (this.snapshotCache.has(location2)) {
        return;
      }
      try {
        const response = await fetch(location2.toString(), { headers: { "VND.PREFETCH": "true", Accept: "text/html" } });
        const responseText = await response.text();
        const snapshot = PageSnapshot.fromHTMLString(responseText);
        this.snapshotCache.put(location2, snapshot);
      } catch (_) {
      }
    }
  };
  var Session = class {
    constructor() {
      this.navigator = new Navigator(this);
      this.history = new History(this);
      this.preloader = new Preloader(this);
      this.view = new PageView(this, document.documentElement);
      this.adapter = new BrowserAdapter(this);
      this.pageObserver = new PageObserver(this);
      this.cacheObserver = new CacheObserver();
      this.linkClickObserver = new LinkClickObserver(this, window);
      this.formSubmitObserver = new FormSubmitObserver(this, document);
      this.scrollObserver = new ScrollObserver(this);
      this.streamObserver = new StreamObserver(this);
      this.formLinkClickObserver = new FormLinkClickObserver(this, document.documentElement);
      this.frameRedirector = new FrameRedirector(this, document.documentElement);
      this.streamMessageRenderer = new StreamMessageRenderer();
      this.drive = true;
      this.enabled = true;
      this.progressBarDelay = 500;
      this.started = false;
      this.formMode = "on";
    }
    start() {
      if (!this.started) {
        this.pageObserver.start();
        this.cacheObserver.start();
        this.formLinkClickObserver.start();
        this.linkClickObserver.start();
        this.formSubmitObserver.start();
        this.scrollObserver.start();
        this.streamObserver.start();
        this.frameRedirector.start();
        this.history.start();
        this.preloader.start();
        this.started = true;
        this.enabled = true;
      }
    }
    disable() {
      this.enabled = false;
    }
    stop() {
      if (this.started) {
        this.pageObserver.stop();
        this.cacheObserver.stop();
        this.formLinkClickObserver.stop();
        this.linkClickObserver.stop();
        this.formSubmitObserver.stop();
        this.scrollObserver.stop();
        this.streamObserver.stop();
        this.frameRedirector.stop();
        this.history.stop();
        this.started = false;
      }
    }
    registerAdapter(adapter) {
      this.adapter = adapter;
    }
    visit(location2, options = {}) {
      const frameElement = options.frame ? document.getElementById(options.frame) : null;
      if (frameElement instanceof FrameElement) {
        frameElement.src = location2.toString();
        frameElement.loaded;
      } else {
        this.navigator.proposeVisit(expandURL(location2), options);
      }
    }
    connectStreamSource(source) {
      this.streamObserver.connectStreamSource(source);
    }
    disconnectStreamSource(source) {
      this.streamObserver.disconnectStreamSource(source);
    }
    renderStreamMessage(message) {
      this.streamMessageRenderer.render(StreamMessage.wrap(message));
    }
    clearCache() {
      this.view.clearSnapshotCache();
    }
    setProgressBarDelay(delay) {
      this.progressBarDelay = delay;
    }
    setFormMode(mode) {
      this.formMode = mode;
    }
    get location() {
      return this.history.location;
    }
    get restorationIdentifier() {
      return this.history.restorationIdentifier;
    }
    historyPoppedToLocationWithRestorationIdentifier(location2, restorationIdentifier) {
      if (this.enabled) {
        this.navigator.startVisit(location2, restorationIdentifier, {
          action: "restore",
          historyChanged: true
        });
      } else {
        this.adapter.pageInvalidated({
          reason: "turbo_disabled"
        });
      }
    }
    scrollPositionChanged(position) {
      this.history.updateRestorationData({ scrollPosition: position });
    }
    willSubmitFormLinkToLocation(link, location2) {
      return this.elementIsNavigatable(link) && locationIsVisitable(location2, this.snapshot.rootLocation);
    }
    submittedFormLinkToLocation() {
    }
    willFollowLinkToLocation(link, location2, event) {
      return this.elementIsNavigatable(link) && locationIsVisitable(location2, this.snapshot.rootLocation) && this.applicationAllowsFollowingLinkToLocation(link, location2, event);
    }
    followedLinkToLocation(link, location2) {
      const action = this.getActionForLink(link);
      const acceptsStreamResponse = link.hasAttribute("data-turbo-stream");
      this.visit(location2.href, { action, acceptsStreamResponse });
    }
    allowsVisitingLocationWithAction(location2, action) {
      return this.locationWithActionIsSamePage(location2, action) || this.applicationAllowsVisitingLocation(location2);
    }
    visitProposedToLocation(location2, options) {
      extendURLWithDeprecatedProperties(location2);
      this.adapter.visitProposedToLocation(location2, options);
    }
    visitStarted(visit2) {
      if (!visit2.acceptsStreamResponse) {
        markAsBusy(document.documentElement);
      }
      extendURLWithDeprecatedProperties(visit2.location);
      if (!visit2.silent) {
        this.notifyApplicationAfterVisitingLocation(visit2.location, visit2.action);
      }
    }
    visitCompleted(visit2) {
      clearBusyState(document.documentElement);
      this.notifyApplicationAfterPageLoad(visit2.getTimingMetrics());
    }
    locationWithActionIsSamePage(location2, action) {
      return this.navigator.locationWithActionIsSamePage(location2, action);
    }
    visitScrolledToSamePageLocation(oldURL, newURL) {
      this.notifyApplicationAfterVisitingSamePageLocation(oldURL, newURL);
    }
    willSubmitForm(form, submitter) {
      const action = getAction(form, submitter);
      return this.submissionIsNavigatable(form, submitter) && locationIsVisitable(expandURL(action), this.snapshot.rootLocation);
    }
    formSubmitted(form, submitter) {
      this.navigator.submitForm(form, submitter);
    }
    pageBecameInteractive() {
      this.view.lastRenderedLocation = this.location;
      this.notifyApplicationAfterPageLoad();
    }
    pageLoaded() {
      this.history.assumeControlOfScrollRestoration();
    }
    pageWillUnload() {
      this.history.relinquishControlOfScrollRestoration();
    }
    receivedMessageFromStream(message) {
      this.renderStreamMessage(message);
    }
    viewWillCacheSnapshot() {
      var _a;
      if (!((_a = this.navigator.currentVisit) === null || _a === void 0 ? void 0 : _a.silent)) {
        this.notifyApplicationBeforeCachingSnapshot();
      }
    }
    allowsImmediateRender({ element }, options) {
      const event = this.notifyApplicationBeforeRender(element, options);
      const { defaultPrevented, detail: { render } } = event;
      if (this.view.renderer && render) {
        this.view.renderer.renderElement = render;
      }
      return !defaultPrevented;
    }
    viewRenderedSnapshot(_snapshot, _isPreview) {
      this.view.lastRenderedLocation = this.history.location;
      this.notifyApplicationAfterRender();
    }
    preloadOnLoadLinksForView(element) {
      this.preloader.preloadOnLoadLinksForView(element);
    }
    viewInvalidated(reason) {
      this.adapter.pageInvalidated(reason);
    }
    frameLoaded(frame) {
      this.notifyApplicationAfterFrameLoad(frame);
    }
    frameRendered(fetchResponse, frame) {
      this.notifyApplicationAfterFrameRender(fetchResponse, frame);
    }
    applicationAllowsFollowingLinkToLocation(link, location2, ev) {
      const event = this.notifyApplicationAfterClickingLinkToLocation(link, location2, ev);
      return !event.defaultPrevented;
    }
    applicationAllowsVisitingLocation(location2) {
      const event = this.notifyApplicationBeforeVisitingLocation(location2);
      return !event.defaultPrevented;
    }
    notifyApplicationAfterClickingLinkToLocation(link, location2, event) {
      return dispatch("turbo:click", {
        target: link,
        detail: { url: location2.href, originalEvent: event },
        cancelable: true
      });
    }
    notifyApplicationBeforeVisitingLocation(location2) {
      return dispatch("turbo:before-visit", {
        detail: { url: location2.href },
        cancelable: true
      });
    }
    notifyApplicationAfterVisitingLocation(location2, action) {
      return dispatch("turbo:visit", { detail: { url: location2.href, action } });
    }
    notifyApplicationBeforeCachingSnapshot() {
      return dispatch("turbo:before-cache");
    }
    notifyApplicationBeforeRender(newBody, options) {
      return dispatch("turbo:before-render", {
        detail: Object.assign({ newBody }, options),
        cancelable: true
      });
    }
    notifyApplicationAfterRender() {
      return dispatch("turbo:render");
    }
    notifyApplicationAfterPageLoad(timing = {}) {
      return dispatch("turbo:load", {
        detail: { url: this.location.href, timing }
      });
    }
    notifyApplicationAfterVisitingSamePageLocation(oldURL, newURL) {
      dispatchEvent(new HashChangeEvent("hashchange", {
        oldURL: oldURL.toString(),
        newURL: newURL.toString()
      }));
    }
    notifyApplicationAfterFrameLoad(frame) {
      return dispatch("turbo:frame-load", { target: frame });
    }
    notifyApplicationAfterFrameRender(fetchResponse, frame) {
      return dispatch("turbo:frame-render", {
        detail: { fetchResponse },
        target: frame,
        cancelable: true
      });
    }
    submissionIsNavigatable(form, submitter) {
      if (this.formMode == "off") {
        return false;
      } else {
        const submitterIsNavigatable = submitter ? this.elementIsNavigatable(submitter) : true;
        if (this.formMode == "optin") {
          return submitterIsNavigatable && form.closest('[data-turbo="true"]') != null;
        } else {
          return submitterIsNavigatable && this.elementIsNavigatable(form);
        }
      }
    }
    elementIsNavigatable(element) {
      const container = findClosestRecursively(element, "[data-turbo]");
      const withinFrame = findClosestRecursively(element, "turbo-frame");
      if (this.drive || withinFrame) {
        if (container) {
          return container.getAttribute("data-turbo") != "false";
        } else {
          return true;
        }
      } else {
        if (container) {
          return container.getAttribute("data-turbo") == "true";
        } else {
          return false;
        }
      }
    }
    getActionForLink(link) {
      return getVisitAction(link) || "advance";
    }
    get snapshot() {
      return this.view.snapshot;
    }
  };
  function extendURLWithDeprecatedProperties(url) {
    Object.defineProperties(url, deprecatedLocationPropertyDescriptors);
  }
  var deprecatedLocationPropertyDescriptors = {
    absoluteURL: {
      get() {
        return this.toString();
      }
    }
  };
  var Cache = class {
    constructor(session2) {
      this.session = session2;
    }
    clear() {
      this.session.clearCache();
    }
    resetCacheControl() {
      this.setCacheControl("");
    }
    exemptPageFromCache() {
      this.setCacheControl("no-cache");
    }
    exemptPageFromPreview() {
      this.setCacheControl("no-preview");
    }
    setCacheControl(value) {
      setMetaContent("turbo-cache-control", value);
    }
  };
  var StreamActions = {
    after() {
      this.targetElements.forEach((e) => {
        var _a;
        return (_a = e.parentElement) === null || _a === void 0 ? void 0 : _a.insertBefore(this.templateContent, e.nextSibling);
      });
    },
    append() {
      this.removeDuplicateTargetChildren();
      this.targetElements.forEach((e) => e.append(this.templateContent));
    },
    before() {
      this.targetElements.forEach((e) => {
        var _a;
        return (_a = e.parentElement) === null || _a === void 0 ? void 0 : _a.insertBefore(this.templateContent, e);
      });
    },
    prepend() {
      this.removeDuplicateTargetChildren();
      this.targetElements.forEach((e) => e.prepend(this.templateContent));
    },
    remove() {
      this.targetElements.forEach((e) => e.remove());
    },
    replace() {
      this.targetElements.forEach((e) => e.replaceWith(this.templateContent));
    },
    update() {
      this.targetElements.forEach((targetElement) => {
        targetElement.innerHTML = "";
        targetElement.append(this.templateContent);
      });
    }
  };
  var session = new Session();
  var cache = new Cache(session);
  var { navigator: navigator$1 } = session;
  function start() {
    session.start();
  }
  function registerAdapter(adapter) {
    session.registerAdapter(adapter);
  }
  function visit(location2, options) {
    session.visit(location2, options);
  }
  function connectStreamSource(source) {
    session.connectStreamSource(source);
  }
  function disconnectStreamSource(source) {
    session.disconnectStreamSource(source);
  }
  function renderStreamMessage(message) {
    session.renderStreamMessage(message);
  }
  function clearCache() {
    console.warn("Please replace `Turbo.clearCache()` with `Turbo.cache.clear()`. The top-level function is deprecated and will be removed in a future version of Turbo.`");
    session.clearCache();
  }
  function setProgressBarDelay(delay) {
    session.setProgressBarDelay(delay);
  }
  function setConfirmMethod(confirmMethod) {
    FormSubmission.confirmMethod = confirmMethod;
  }
  function setFormMode(mode) {
    session.setFormMode(mode);
  }
  var Turbo2 = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    navigator: navigator$1,
    session,
    cache,
    PageRenderer,
    PageSnapshot,
    FrameRenderer,
    start,
    registerAdapter,
    visit,
    connectStreamSource,
    disconnectStreamSource,
    renderStreamMessage,
    clearCache,
    setProgressBarDelay,
    setConfirmMethod,
    setFormMode,
    StreamActions
  });
  var FrameController = class {
    constructor(element) {
      this.fetchResponseLoaded = (_fetchResponse) => {
      };
      this.currentFetchRequest = null;
      this.resolveVisitPromise = () => {
      };
      this.connected = false;
      this.hasBeenLoaded = false;
      this.ignoredAttributes = /* @__PURE__ */ new Set();
      this.action = null;
      this.visitCachedSnapshot = ({ element: element2 }) => {
        const frame = element2.querySelector("#" + this.element.id);
        if (frame && this.previousFrameElement) {
          frame.replaceChildren(...this.previousFrameElement.children);
        }
        delete this.previousFrameElement;
      };
      this.element = element;
      this.view = new FrameView(this, this.element);
      this.appearanceObserver = new AppearanceObserver(this, this.element);
      this.formLinkClickObserver = new FormLinkClickObserver(this, this.element);
      this.linkInterceptor = new LinkInterceptor(this, this.element);
      this.restorationIdentifier = uuid();
      this.formSubmitObserver = new FormSubmitObserver(this, this.element);
    }
    connect() {
      if (!this.connected) {
        this.connected = true;
        if (this.loadingStyle == FrameLoadingStyle.lazy) {
          this.appearanceObserver.start();
        } else {
          this.loadSourceURL();
        }
        this.formLinkClickObserver.start();
        this.linkInterceptor.start();
        this.formSubmitObserver.start();
      }
    }
    disconnect() {
      if (this.connected) {
        this.connected = false;
        this.appearanceObserver.stop();
        this.formLinkClickObserver.stop();
        this.linkInterceptor.stop();
        this.formSubmitObserver.stop();
      }
    }
    disabledChanged() {
      if (this.loadingStyle == FrameLoadingStyle.eager) {
        this.loadSourceURL();
      }
    }
    sourceURLChanged() {
      if (this.isIgnoringChangesTo("src"))
        return;
      if (this.element.isConnected) {
        this.complete = false;
      }
      if (this.loadingStyle == FrameLoadingStyle.eager || this.hasBeenLoaded) {
        this.loadSourceURL();
      }
    }
    sourceURLReloaded() {
      const { src } = this.element;
      this.ignoringChangesToAttribute("complete", () => {
        this.element.removeAttribute("complete");
      });
      this.element.src = null;
      this.element.src = src;
      return this.element.loaded;
    }
    completeChanged() {
      if (this.isIgnoringChangesTo("complete"))
        return;
      this.loadSourceURL();
    }
    loadingStyleChanged() {
      if (this.loadingStyle == FrameLoadingStyle.lazy) {
        this.appearanceObserver.start();
      } else {
        this.appearanceObserver.stop();
        this.loadSourceURL();
      }
    }
    async loadSourceURL() {
      if (this.enabled && this.isActive && !this.complete && this.sourceURL) {
        this.element.loaded = this.visit(expandURL(this.sourceURL));
        this.appearanceObserver.stop();
        await this.element.loaded;
        this.hasBeenLoaded = true;
      }
    }
    async loadResponse(fetchResponse) {
      if (fetchResponse.redirected || fetchResponse.succeeded && fetchResponse.isHTML) {
        this.sourceURL = fetchResponse.response.url;
      }
      try {
        const html = await fetchResponse.responseHTML;
        if (html) {
          const { body } = parseHTMLDocument(html);
          const newFrameElement = await this.extractForeignFrameElement(body);
          if (newFrameElement) {
            const snapshot = new Snapshot(newFrameElement);
            const renderer = new FrameRenderer(this, this.view.snapshot, snapshot, FrameRenderer.renderElement, false, false);
            if (this.view.renderPromise)
              await this.view.renderPromise;
            this.changeHistory();
            await this.view.render(renderer);
            this.complete = true;
            session.frameRendered(fetchResponse, this.element);
            session.frameLoaded(this.element);
            this.fetchResponseLoaded(fetchResponse);
          } else if (this.willHandleFrameMissingFromResponse(fetchResponse)) {
            console.warn(`A matching frame for #${this.element.id} was missing from the response, transforming into full-page Visit.`);
            this.visitResponse(fetchResponse.response);
          }
        }
      } catch (error2) {
        console.error(error2);
        this.view.invalidate();
      } finally {
        this.fetchResponseLoaded = () => {
        };
      }
    }
    elementAppearedInViewport(element) {
      this.proposeVisitIfNavigatedWithAction(element, element);
      this.loadSourceURL();
    }
    willSubmitFormLinkToLocation(link) {
      return this.shouldInterceptNavigation(link);
    }
    submittedFormLinkToLocation(link, _location, form) {
      const frame = this.findFrameElement(link);
      if (frame)
        form.setAttribute("data-turbo-frame", frame.id);
    }
    shouldInterceptLinkClick(element, _location, _event) {
      return this.shouldInterceptNavigation(element);
    }
    linkClickIntercepted(element, location2) {
      this.navigateFrame(element, location2);
    }
    willSubmitForm(element, submitter) {
      return element.closest("turbo-frame") == this.element && this.shouldInterceptNavigation(element, submitter);
    }
    formSubmitted(element, submitter) {
      if (this.formSubmission) {
        this.formSubmission.stop();
      }
      this.formSubmission = new FormSubmission(this, element, submitter);
      const { fetchRequest } = this.formSubmission;
      this.prepareRequest(fetchRequest);
      this.formSubmission.start();
    }
    prepareRequest(request) {
      var _a;
      request.headers["Turbo-Frame"] = this.id;
      if ((_a = this.currentNavigationElement) === null || _a === void 0 ? void 0 : _a.hasAttribute("data-turbo-stream")) {
        request.acceptResponseType(StreamMessage.contentType);
      }
    }
    requestStarted(_request) {
      markAsBusy(this.element);
    }
    requestPreventedHandlingResponse(_request, _response) {
      this.resolveVisitPromise();
    }
    async requestSucceededWithResponse(request, response) {
      await this.loadResponse(response);
      this.resolveVisitPromise();
    }
    async requestFailedWithResponse(request, response) {
      console.error(response);
      await this.loadResponse(response);
      this.resolveVisitPromise();
    }
    requestErrored(request, error2) {
      console.error(error2);
      this.resolveVisitPromise();
    }
    requestFinished(_request) {
      clearBusyState(this.element);
    }
    formSubmissionStarted({ formElement }) {
      markAsBusy(formElement, this.findFrameElement(formElement));
    }
    formSubmissionSucceededWithResponse(formSubmission, response) {
      const frame = this.findFrameElement(formSubmission.formElement, formSubmission.submitter);
      frame.delegate.proposeVisitIfNavigatedWithAction(frame, formSubmission.formElement, formSubmission.submitter);
      frame.delegate.loadResponse(response);
    }
    formSubmissionFailedWithResponse(formSubmission, fetchResponse) {
      this.element.delegate.loadResponse(fetchResponse);
    }
    formSubmissionErrored(formSubmission, error2) {
      console.error(error2);
    }
    formSubmissionFinished({ formElement }) {
      clearBusyState(formElement, this.findFrameElement(formElement));
    }
    allowsImmediateRender({ element: newFrame }, options) {
      const event = dispatch("turbo:before-frame-render", {
        target: this.element,
        detail: Object.assign({ newFrame }, options),
        cancelable: true
      });
      const { defaultPrevented, detail: { render } } = event;
      if (this.view.renderer && render) {
        this.view.renderer.renderElement = render;
      }
      return !defaultPrevented;
    }
    viewRenderedSnapshot(_snapshot, _isPreview) {
    }
    preloadOnLoadLinksForView(element) {
      session.preloadOnLoadLinksForView(element);
    }
    viewInvalidated() {
    }
    willRenderFrame(currentElement, _newElement) {
      this.previousFrameElement = currentElement.cloneNode(true);
    }
    async visit(url) {
      var _a;
      const request = new FetchRequest(this, FetchMethod.get, url, new URLSearchParams(), this.element);
      (_a = this.currentFetchRequest) === null || _a === void 0 ? void 0 : _a.cancel();
      this.currentFetchRequest = request;
      return new Promise((resolve) => {
        this.resolveVisitPromise = () => {
          this.resolveVisitPromise = () => {
          };
          this.currentFetchRequest = null;
          resolve();
        };
        request.perform();
      });
    }
    navigateFrame(element, url, submitter) {
      const frame = this.findFrameElement(element, submitter);
      frame.delegate.proposeVisitIfNavigatedWithAction(frame, element, submitter);
      this.withCurrentNavigationElement(element, () => {
        frame.src = url;
      });
    }
    proposeVisitIfNavigatedWithAction(frame, element, submitter) {
      this.action = getVisitAction(submitter, element, frame);
      if (this.action) {
        const pageSnapshot = PageSnapshot.fromElement(frame).clone();
        const { visitCachedSnapshot } = frame.delegate;
        frame.delegate.fetchResponseLoaded = (fetchResponse) => {
          if (frame.src) {
            const { statusCode, redirected } = fetchResponse;
            const responseHTML = frame.ownerDocument.documentElement.outerHTML;
            const response = { statusCode, redirected, responseHTML };
            const options = {
              response,
              visitCachedSnapshot,
              willRender: false,
              updateHistory: false,
              restorationIdentifier: this.restorationIdentifier,
              snapshot: pageSnapshot
            };
            if (this.action)
              options.action = this.action;
            session.visit(frame.src, options);
          }
        };
      }
    }
    changeHistory() {
      if (this.action) {
        const method = getHistoryMethodForAction(this.action);
        session.history.update(method, expandURL(this.element.src || ""), this.restorationIdentifier);
      }
    }
    willHandleFrameMissingFromResponse(fetchResponse) {
      this.element.setAttribute("complete", "");
      const response = fetchResponse.response;
      const visit2 = async (url, options = {}) => {
        if (url instanceof Response) {
          this.visitResponse(url);
        } else {
          session.visit(url, options);
        }
      };
      const event = dispatch("turbo:frame-missing", {
        target: this.element,
        detail: { response, visit: visit2 },
        cancelable: true
      });
      return !event.defaultPrevented;
    }
    async visitResponse(response) {
      const wrapped = new FetchResponse(response);
      const responseHTML = await wrapped.responseHTML;
      const { location: location2, redirected, statusCode } = wrapped;
      return session.visit(location2, { response: { redirected, statusCode, responseHTML } });
    }
    findFrameElement(element, submitter) {
      var _a;
      const id = getAttribute("data-turbo-frame", submitter, element) || this.element.getAttribute("target");
      return (_a = getFrameElementById(id)) !== null && _a !== void 0 ? _a : this.element;
    }
    async extractForeignFrameElement(container) {
      let element;
      const id = CSS.escape(this.id);
      try {
        element = activateElement(container.querySelector(`turbo-frame#${id}`), this.sourceURL);
        if (element) {
          return element;
        }
        element = activateElement(container.querySelector(`turbo-frame[src][recurse~=${id}]`), this.sourceURL);
        if (element) {
          await element.loaded;
          return await this.extractForeignFrameElement(element);
        }
      } catch (error2) {
        console.error(error2);
        return new FrameElement();
      }
      return null;
    }
    formActionIsVisitable(form, submitter) {
      const action = getAction(form, submitter);
      return locationIsVisitable(expandURL(action), this.rootLocation);
    }
    shouldInterceptNavigation(element, submitter) {
      const id = getAttribute("data-turbo-frame", submitter, element) || this.element.getAttribute("target");
      if (element instanceof HTMLFormElement && !this.formActionIsVisitable(element, submitter)) {
        return false;
      }
      if (!this.enabled || id == "_top") {
        return false;
      }
      if (id) {
        const frameElement = getFrameElementById(id);
        if (frameElement) {
          return !frameElement.disabled;
        }
      }
      if (!session.elementIsNavigatable(element)) {
        return false;
      }
      if (submitter && !session.elementIsNavigatable(submitter)) {
        return false;
      }
      return true;
    }
    get id() {
      return this.element.id;
    }
    get enabled() {
      return !this.element.disabled;
    }
    get sourceURL() {
      if (this.element.src) {
        return this.element.src;
      }
    }
    set sourceURL(sourceURL) {
      this.ignoringChangesToAttribute("src", () => {
        this.element.src = sourceURL !== null && sourceURL !== void 0 ? sourceURL : null;
      });
    }
    get loadingStyle() {
      return this.element.loading;
    }
    get isLoading() {
      return this.formSubmission !== void 0 || this.resolveVisitPromise() !== void 0;
    }
    get complete() {
      return this.element.hasAttribute("complete");
    }
    set complete(value) {
      this.ignoringChangesToAttribute("complete", () => {
        if (value) {
          this.element.setAttribute("complete", "");
        } else {
          this.element.removeAttribute("complete");
        }
      });
    }
    get isActive() {
      return this.element.isActive && this.connected;
    }
    get rootLocation() {
      var _a;
      const meta = this.element.ownerDocument.querySelector(`meta[name="turbo-root"]`);
      const root = (_a = meta === null || meta === void 0 ? void 0 : meta.content) !== null && _a !== void 0 ? _a : "/";
      return expandURL(root);
    }
    isIgnoringChangesTo(attributeName) {
      return this.ignoredAttributes.has(attributeName);
    }
    ignoringChangesToAttribute(attributeName, callback) {
      this.ignoredAttributes.add(attributeName);
      callback();
      this.ignoredAttributes.delete(attributeName);
    }
    withCurrentNavigationElement(element, callback) {
      this.currentNavigationElement = element;
      callback();
      delete this.currentNavigationElement;
    }
  };
  function getFrameElementById(id) {
    if (id != null) {
      const element = document.getElementById(id);
      if (element instanceof FrameElement) {
        return element;
      }
    }
  }
  function activateElement(element, currentURL) {
    if (element) {
      const src = element.getAttribute("src");
      if (src != null && currentURL != null && urlsAreEqual(src, currentURL)) {
        throw new Error(`Matching <turbo-frame id="${element.id}"> element has a source URL which references itself`);
      }
      if (element.ownerDocument !== document) {
        element = document.importNode(element, true);
      }
      if (element instanceof FrameElement) {
        element.connectedCallback();
        element.disconnectedCallback();
        return element;
      }
    }
  }
  var StreamElement = class extends HTMLElement {
    static async renderElement(newElement) {
      await newElement.performAction();
    }
    async connectedCallback() {
      try {
        await this.render();
      } catch (error2) {
        console.error(error2);
      } finally {
        this.disconnect();
      }
    }
    async render() {
      var _a;
      return (_a = this.renderPromise) !== null && _a !== void 0 ? _a : this.renderPromise = (async () => {
        const event = this.beforeRenderEvent;
        if (this.dispatchEvent(event)) {
          await nextAnimationFrame();
          await event.detail.render(this);
        }
      })();
    }
    disconnect() {
      try {
        this.remove();
      } catch (_a) {
      }
    }
    removeDuplicateTargetChildren() {
      this.duplicateChildren.forEach((c) => c.remove());
    }
    get duplicateChildren() {
      var _a;
      const existingChildren = this.targetElements.flatMap((e) => [...e.children]).filter((c) => !!c.id);
      const newChildrenIds = [...((_a = this.templateContent) === null || _a === void 0 ? void 0 : _a.children) || []].filter((c) => !!c.id).map((c) => c.id);
      return existingChildren.filter((c) => newChildrenIds.includes(c.id));
    }
    get performAction() {
      if (this.action) {
        const actionFunction = StreamActions[this.action];
        if (actionFunction) {
          return actionFunction;
        }
        this.raise("unknown action");
      }
      this.raise("action attribute is missing");
    }
    get targetElements() {
      if (this.target) {
        return this.targetElementsById;
      } else if (this.targets) {
        return this.targetElementsByQuery;
      } else {
        this.raise("target or targets attribute is missing");
      }
    }
    get templateContent() {
      return this.templateElement.content.cloneNode(true);
    }
    get templateElement() {
      if (this.firstElementChild === null) {
        const template = this.ownerDocument.createElement("template");
        this.appendChild(template);
        return template;
      } else if (this.firstElementChild instanceof HTMLTemplateElement) {
        return this.firstElementChild;
      }
      this.raise("first child element must be a <template> element");
    }
    get action() {
      return this.getAttribute("action");
    }
    get target() {
      return this.getAttribute("target");
    }
    get targets() {
      return this.getAttribute("targets");
    }
    raise(message) {
      throw new Error(`${this.description}: ${message}`);
    }
    get description() {
      var _a, _b;
      return (_b = ((_a = this.outerHTML.match(/<[^>]+>/)) !== null && _a !== void 0 ? _a : [])[0]) !== null && _b !== void 0 ? _b : "<turbo-stream>";
    }
    get beforeRenderEvent() {
      return new CustomEvent("turbo:before-stream-render", {
        bubbles: true,
        cancelable: true,
        detail: { newStream: this, render: StreamElement.renderElement }
      });
    }
    get targetElementsById() {
      var _a;
      const element = (_a = this.ownerDocument) === null || _a === void 0 ? void 0 : _a.getElementById(this.target);
      if (element !== null) {
        return [element];
      } else {
        return [];
      }
    }
    get targetElementsByQuery() {
      var _a;
      const elements = (_a = this.ownerDocument) === null || _a === void 0 ? void 0 : _a.querySelectorAll(this.targets);
      if (elements.length !== 0) {
        return Array.prototype.slice.call(elements);
      } else {
        return [];
      }
    }
  };
  var StreamSourceElement = class extends HTMLElement {
    constructor() {
      super(...arguments);
      this.streamSource = null;
    }
    connectedCallback() {
      this.streamSource = this.src.match(/^ws{1,2}:/) ? new WebSocket(this.src) : new EventSource(this.src);
      connectStreamSource(this.streamSource);
    }
    disconnectedCallback() {
      if (this.streamSource) {
        disconnectStreamSource(this.streamSource);
      }
    }
    get src() {
      return this.getAttribute("src") || "";
    }
  };
  FrameElement.delegateConstructor = FrameController;
  if (customElements.get("turbo-frame") === void 0) {
    customElements.define("turbo-frame", FrameElement);
  }
  if (customElements.get("turbo-stream") === void 0) {
    customElements.define("turbo-stream", StreamElement);
  }
  if (customElements.get("turbo-stream-source") === void 0) {
    customElements.define("turbo-stream-source", StreamSourceElement);
  }
  (() => {
    let element = document.currentScript;
    if (!element)
      return;
    if (element.hasAttribute("data-turbo-suppress-warning"))
      return;
    element = element.parentElement;
    while (element) {
      if (element == document.body) {
        return console.warn(unindent`
        You are loading Turbo from a <script> element inside the <body> element. This is probably not what you meant to do!

        Load your application’s JavaScript bundle inside the <head> element instead. <script> elements in <body> are evaluated with each page change.

        For more information, see: https://turbo.hotwired.dev/handbook/building#working-with-script-elements

        ——
        Suppress this warning by adding a "data-turbo-suppress-warning" attribute to: %s
      `, element.outerHTML);
      }
      element = element.parentElement;
    }
  })();
  window.Turbo = Turbo2;
  start();

  // node_modules/@hotwired/turbo-rails/app/javascript/turbo/cable.js
  var consumer;
  async function getConsumer() {
    return consumer || setConsumer(createConsumer2().then(setConsumer));
  }
  function setConsumer(newConsumer) {
    return consumer = newConsumer;
  }
  async function createConsumer2() {
    const { createConsumer: createConsumer3 } = await Promise.resolve().then(() => (init_src(), src_exports));
    return createConsumer3();
  }
  async function subscribeTo(channel, mixin) {
    const { subscriptions } = await getConsumer();
    return subscriptions.create(channel, mixin);
  }

  // node_modules/@hotwired/turbo-rails/app/javascript/turbo/snakeize.js
  function walk(obj) {
    if (!obj || typeof obj !== "object")
      return obj;
    if (obj instanceof Date || obj instanceof RegExp)
      return obj;
    if (Array.isArray(obj))
      return obj.map(walk);
    return Object.keys(obj).reduce(function(acc, key) {
      var camel = key[0].toLowerCase() + key.slice(1).replace(/([A-Z]+)/g, function(m, x) {
        return "_" + x.toLowerCase();
      });
      acc[camel] = walk(obj[key]);
      return acc;
    }, {});
  }

  // node_modules/@hotwired/turbo-rails/app/javascript/turbo/cable_stream_source_element.js
  var TurboCableStreamSourceElement = class extends HTMLElement {
    async connectedCallback() {
      connectStreamSource(this);
      this.subscription = await subscribeTo(this.channel, { received: this.dispatchMessageEvent.bind(this) });
    }
    disconnectedCallback() {
      disconnectStreamSource(this);
      if (this.subscription)
        this.subscription.unsubscribe();
    }
    dispatchMessageEvent(data) {
      const event = new MessageEvent("message", { data });
      return this.dispatchEvent(event);
    }
    get channel() {
      const channel = this.getAttribute("channel");
      const signed_stream_name = this.getAttribute("signed-stream-name");
      return { channel, signed_stream_name, ...walk({ ...this.dataset }) };
    }
  };
  if (customElements.get("turbo-cable-stream-source") === void 0) {
    customElements.define("turbo-cable-stream-source", TurboCableStreamSourceElement);
  }

  // node_modules/@hotwired/turbo-rails/app/javascript/turbo/fetch_requests.js
  function encodeMethodIntoRequestBody(event) {
    if (event.target instanceof HTMLFormElement) {
      const { target: form, detail: { fetchOptions } } = event;
      form.addEventListener("turbo:submit-start", ({ detail: { formSubmission: { submitter } } }) => {
        const body = isBodyInit(fetchOptions.body) ? fetchOptions.body : new URLSearchParams();
        const method = determineFetchMethod(submitter, body, form);
        if (!/get/i.test(method)) {
          if (/post/i.test(method)) {
            body.delete("_method");
          } else {
            body.set("_method", method);
          }
          fetchOptions.method = "post";
        }
      }, { once: true });
    }
  }
  function determineFetchMethod(submitter, body, form) {
    const formMethod = determineFormMethod(submitter);
    const overrideMethod = body.get("_method");
    const method = form.getAttribute("method") || "get";
    if (typeof formMethod == "string") {
      return formMethod;
    } else if (typeof overrideMethod == "string") {
      return overrideMethod;
    } else {
      return method;
    }
  }
  function determineFormMethod(submitter) {
    if (submitter instanceof HTMLButtonElement || submitter instanceof HTMLInputElement) {
      if (submitter.hasAttribute("formmethod")) {
        return submitter.formMethod;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
  function isBodyInit(body) {
    return body instanceof FormData || body instanceof URLSearchParams;
  }

  // node_modules/@hotwired/turbo-rails/app/javascript/turbo/index.js
  addEventListener("turbo:before-fetch-request", encodeMethodIntoRequestBody);

  // app/javascript/application.js
  var import_ujs2 = __toESM(require_rails_ujs());

  // node_modules/hotkeys-js/dist/hotkeys.esm.js
  var isff = typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase().indexOf("firefox") > 0 : false;
  function addEvent(object, event, method, useCapture) {
    if (object.addEventListener) {
      object.addEventListener(event, method, useCapture);
    } else if (object.attachEvent) {
      object.attachEvent("on".concat(event), function() {
        method(window.event);
      });
    }
  }
  function getMods(modifier, key) {
    var mods = key.slice(0, key.length - 1);
    for (var i = 0; i < mods.length; i++) {
      mods[i] = modifier[mods[i].toLowerCase()];
    }
    return mods;
  }
  function getKeys(key) {
    if (typeof key !== "string")
      key = "";
    key = key.replace(/\s/g, "");
    var keys = key.split(",");
    var index = keys.lastIndexOf("");
    for (; index >= 0; ) {
      keys[index - 1] += ",";
      keys.splice(index, 1);
      index = keys.lastIndexOf("");
    }
    return keys;
  }
  function compareArray(a1, a2) {
    var arr1 = a1.length >= a2.length ? a1 : a2;
    var arr2 = a1.length >= a2.length ? a2 : a1;
    var isIndex = true;
    for (var i = 0; i < arr1.length; i++) {
      if (arr2.indexOf(arr1[i]) === -1)
        isIndex = false;
    }
    return isIndex;
  }
  var _keyMap = {
    backspace: 8,
    "\u232B": 8,
    tab: 9,
    clear: 12,
    enter: 13,
    "\u21A9": 13,
    return: 13,
    esc: 27,
    escape: 27,
    space: 32,
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    del: 46,
    delete: 46,
    ins: 45,
    insert: 45,
    home: 36,
    end: 35,
    pageup: 33,
    pagedown: 34,
    capslock: 20,
    num_0: 96,
    num_1: 97,
    num_2: 98,
    num_3: 99,
    num_4: 100,
    num_5: 101,
    num_6: 102,
    num_7: 103,
    num_8: 104,
    num_9: 105,
    num_multiply: 106,
    num_add: 107,
    num_enter: 108,
    num_subtract: 109,
    num_decimal: 110,
    num_divide: 111,
    "\u21EA": 20,
    ",": 188,
    ".": 190,
    "/": 191,
    "`": 192,
    "-": isff ? 173 : 189,
    "=": isff ? 61 : 187,
    ";": isff ? 59 : 186,
    "'": 222,
    "[": 219,
    "]": 221,
    "\\": 220
  };
  var _modifier = {
    // shiftKey
    "\u21E7": 16,
    shift: 16,
    // altKey
    "\u2325": 18,
    alt: 18,
    option: 18,
    // ctrlKey
    "\u2303": 17,
    ctrl: 17,
    control: 17,
    // metaKey
    "\u2318": 91,
    cmd: 91,
    command: 91
  };
  var modifierMap = {
    16: "shiftKey",
    18: "altKey",
    17: "ctrlKey",
    91: "metaKey",
    shiftKey: 16,
    ctrlKey: 17,
    altKey: 18,
    metaKey: 91
  };
  var _mods = {
    16: false,
    18: false,
    17: false,
    91: false
  };
  var _handlers = {};
  for (k = 1; k < 20; k++) {
    _keyMap["f".concat(k)] = 111 + k;
  }
  var k;
  var _downKeys = [];
  var winListendFocus = false;
  var _scope = "all";
  var elementHasBindEvent = [];
  var code = function code2(x) {
    return _keyMap[x.toLowerCase()] || _modifier[x.toLowerCase()] || x.toUpperCase().charCodeAt(0);
  };
  var getKey = function getKey2(x) {
    return Object.keys(_keyMap).find(function(k) {
      return _keyMap[k] === x;
    });
  };
  var getModifier = function getModifier2(x) {
    return Object.keys(_modifier).find(function(k) {
      return _modifier[k] === x;
    });
  };
  function setScope(scope) {
    _scope = scope || "all";
  }
  function getScope() {
    return _scope || "all";
  }
  function getPressedKeyCodes() {
    return _downKeys.slice(0);
  }
  function getPressedKeyString() {
    return _downKeys.map(function(c) {
      return getKey(c) || getModifier(c) || String.fromCharCode(c);
    });
  }
  function filter(event) {
    var target = event.target || event.srcElement;
    var tagName = target.tagName;
    var flag = true;
    if (target.isContentEditable || (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") && !target.readOnly) {
      flag = false;
    }
    return flag;
  }
  function isPressed(keyCode) {
    if (typeof keyCode === "string") {
      keyCode = code(keyCode);
    }
    return _downKeys.indexOf(keyCode) !== -1;
  }
  function deleteScope(scope, newScope) {
    var handlers;
    var i;
    if (!scope)
      scope = getScope();
    for (var key in _handlers) {
      if (Object.prototype.hasOwnProperty.call(_handlers, key)) {
        handlers = _handlers[key];
        for (i = 0; i < handlers.length; ) {
          if (handlers[i].scope === scope)
            handlers.splice(i, 1);
          else
            i++;
        }
      }
    }
    if (getScope() === scope)
      setScope(newScope || "all");
  }
  function clearModifier(event) {
    var key = event.keyCode || event.which || event.charCode;
    var i = _downKeys.indexOf(key);
    if (i >= 0) {
      _downKeys.splice(i, 1);
    }
    if (event.key && event.key.toLowerCase() === "meta") {
      _downKeys.splice(0, _downKeys.length);
    }
    if (key === 93 || key === 224)
      key = 91;
    if (key in _mods) {
      _mods[key] = false;
      for (var k in _modifier) {
        if (_modifier[k] === key)
          hotkeys[k] = false;
      }
    }
  }
  function unbind(keysInfo) {
    if (typeof keysInfo === "undefined") {
      Object.keys(_handlers).forEach(function(key) {
        return delete _handlers[key];
      });
    } else if (Array.isArray(keysInfo)) {
      keysInfo.forEach(function(info) {
        if (info.key)
          eachUnbind(info);
      });
    } else if (typeof keysInfo === "object") {
      if (keysInfo.key)
        eachUnbind(keysInfo);
    } else if (typeof keysInfo === "string") {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      var scope = args[0], method = args[1];
      if (typeof scope === "function") {
        method = scope;
        scope = "";
      }
      eachUnbind({
        key: keysInfo,
        scope,
        method,
        splitKey: "+"
      });
    }
  }
  var eachUnbind = function eachUnbind2(_ref) {
    var key = _ref.key, scope = _ref.scope, method = _ref.method, _ref$splitKey = _ref.splitKey, splitKey = _ref$splitKey === void 0 ? "+" : _ref$splitKey;
    var multipleKeys = getKeys(key);
    multipleKeys.forEach(function(originKey) {
      var unbindKeys = originKey.split(splitKey);
      var len = unbindKeys.length;
      var lastKey = unbindKeys[len - 1];
      var keyCode = lastKey === "*" ? "*" : code(lastKey);
      if (!_handlers[keyCode])
        return;
      if (!scope)
        scope = getScope();
      var mods = len > 1 ? getMods(_modifier, unbindKeys) : [];
      _handlers[keyCode] = _handlers[keyCode].filter(function(record) {
        var isMatchingMethod = method ? record.method === method : true;
        return !(isMatchingMethod && record.scope === scope && compareArray(record.mods, mods));
      });
    });
  };
  function eventHandler(event, handler, scope, element) {
    if (handler.element !== element) {
      return;
    }
    var modifiersMatch;
    if (handler.scope === scope || handler.scope === "all") {
      modifiersMatch = handler.mods.length > 0;
      for (var y in _mods) {
        if (Object.prototype.hasOwnProperty.call(_mods, y)) {
          if (!_mods[y] && handler.mods.indexOf(+y) > -1 || _mods[y] && handler.mods.indexOf(+y) === -1) {
            modifiersMatch = false;
          }
        }
      }
      if (handler.mods.length === 0 && !_mods[16] && !_mods[18] && !_mods[17] && !_mods[91] || modifiersMatch || handler.shortcut === "*") {
        if (handler.method(event, handler) === false) {
          if (event.preventDefault)
            event.preventDefault();
          else
            event.returnValue = false;
          if (event.stopPropagation)
            event.stopPropagation();
          if (event.cancelBubble)
            event.cancelBubble = true;
        }
      }
    }
  }
  function dispatch2(event, element) {
    var asterisk = _handlers["*"];
    var key = event.keyCode || event.which || event.charCode;
    if (!hotkeys.filter.call(this, event))
      return;
    if (key === 93 || key === 224)
      key = 91;
    if (_downKeys.indexOf(key) === -1 && key !== 229)
      _downKeys.push(key);
    ["ctrlKey", "altKey", "shiftKey", "metaKey"].forEach(function(keyName) {
      var keyNum = modifierMap[keyName];
      if (event[keyName] && _downKeys.indexOf(keyNum) === -1) {
        _downKeys.push(keyNum);
      } else if (!event[keyName] && _downKeys.indexOf(keyNum) > -1) {
        _downKeys.splice(_downKeys.indexOf(keyNum), 1);
      } else if (keyName === "metaKey" && event[keyName] && _downKeys.length === 3) {
        if (!(event.ctrlKey || event.shiftKey || event.altKey)) {
          _downKeys = _downKeys.slice(_downKeys.indexOf(keyNum));
        }
      }
    });
    if (key in _mods) {
      _mods[key] = true;
      for (var k in _modifier) {
        if (_modifier[k] === key)
          hotkeys[k] = true;
      }
      if (!asterisk)
        return;
    }
    for (var e in _mods) {
      if (Object.prototype.hasOwnProperty.call(_mods, e)) {
        _mods[e] = event[modifierMap[e]];
      }
    }
    if (event.getModifierState && !(event.altKey && !event.ctrlKey) && event.getModifierState("AltGraph")) {
      if (_downKeys.indexOf(17) === -1) {
        _downKeys.push(17);
      }
      if (_downKeys.indexOf(18) === -1) {
        _downKeys.push(18);
      }
      _mods[17] = true;
      _mods[18] = true;
    }
    var scope = getScope();
    if (asterisk) {
      for (var i = 0; i < asterisk.length; i++) {
        if (asterisk[i].scope === scope && (event.type === "keydown" && asterisk[i].keydown || event.type === "keyup" && asterisk[i].keyup)) {
          eventHandler(event, asterisk[i], scope, element);
        }
      }
    }
    if (!(key in _handlers))
      return;
    for (var _i = 0; _i < _handlers[key].length; _i++) {
      if (event.type === "keydown" && _handlers[key][_i].keydown || event.type === "keyup" && _handlers[key][_i].keyup) {
        if (_handlers[key][_i].key) {
          var record = _handlers[key][_i];
          var splitKey = record.splitKey;
          var keyShortcut = record.key.split(splitKey);
          var _downKeysCurrent = [];
          for (var a = 0; a < keyShortcut.length; a++) {
            _downKeysCurrent.push(code(keyShortcut[a]));
          }
          if (_downKeysCurrent.sort().join("") === _downKeys.sort().join("")) {
            eventHandler(event, record, scope, element);
          }
        }
      }
    }
  }
  function isElementBind(element) {
    return elementHasBindEvent.indexOf(element) > -1;
  }
  function hotkeys(key, option, method) {
    _downKeys = [];
    var keys = getKeys(key);
    var mods = [];
    var scope = "all";
    var element = document;
    var i = 0;
    var keyup = false;
    var keydown = true;
    var splitKey = "+";
    var capture = false;
    if (method === void 0 && typeof option === "function") {
      method = option;
    }
    if (Object.prototype.toString.call(option) === "[object Object]") {
      if (option.scope)
        scope = option.scope;
      if (option.element)
        element = option.element;
      if (option.keyup)
        keyup = option.keyup;
      if (option.keydown !== void 0)
        keydown = option.keydown;
      if (option.capture !== void 0)
        capture = option.capture;
      if (typeof option.splitKey === "string")
        splitKey = option.splitKey;
    }
    if (typeof option === "string")
      scope = option;
    for (; i < keys.length; i++) {
      key = keys[i].split(splitKey);
      mods = [];
      if (key.length > 1)
        mods = getMods(_modifier, key);
      key = key[key.length - 1];
      key = key === "*" ? "*" : code(key);
      if (!(key in _handlers))
        _handlers[key] = [];
      _handlers[key].push({
        keyup,
        keydown,
        scope,
        mods,
        shortcut: keys[i],
        method,
        key: keys[i],
        splitKey,
        element
      });
    }
    if (typeof element !== "undefined" && !isElementBind(element) && window) {
      elementHasBindEvent.push(element);
      addEvent(element, "keydown", function(e) {
        dispatch2(e, element);
      }, capture);
      if (!winListendFocus) {
        winListendFocus = true;
        addEvent(window, "focus", function() {
          _downKeys = [];
        }, capture);
      }
      addEvent(element, "keyup", function(e) {
        dispatch2(e, element);
        clearModifier(e);
      }, capture);
    }
  }
  function trigger(shortcut) {
    var scope = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "all";
    Object.keys(_handlers).forEach(function(key) {
      var dataList = _handlers[key].filter(function(item) {
        return item.scope === scope && item.shortcut === shortcut;
      });
      dataList.forEach(function(data) {
        if (data && data.method) {
          data.method();
        }
      });
    });
  }
  var _api = {
    getPressedKeyString,
    setScope,
    getScope,
    deleteScope,
    getPressedKeyCodes,
    isPressed,
    filter,
    trigger,
    unbind,
    keyMap: _keyMap,
    modifier: _modifier,
    modifierMap
  };
  for (a in _api) {
    if (Object.prototype.hasOwnProperty.call(_api, a)) {
      hotkeys[a] = _api[a];
    }
  }
  var a;
  if (typeof window !== "undefined") {
    _hotkeys = window.hotkeys;
    hotkeys.noConflict = function(deep) {
      if (deep && window.hotkeys === hotkeys) {
        window.hotkeys = _hotkeys;
      }
      return hotkeys;
    };
    window.hotkeys = hotkeys;
  }
  var _hotkeys;

  // node_modules/@rails/request.js/src/fetch_response.js
  var FetchResponse2 = class {
    constructor(response) {
      this.response = response;
    }
    get statusCode() {
      return this.response.status;
    }
    get redirected() {
      return this.response.redirected;
    }
    get ok() {
      return this.response.ok;
    }
    get unauthenticated() {
      return this.statusCode === 401;
    }
    get unprocessableEntity() {
      return this.statusCode === 422;
    }
    get authenticationURL() {
      return this.response.headers.get("WWW-Authenticate");
    }
    get contentType() {
      const contentType = this.response.headers.get("Content-Type") || "";
      return contentType.replace(/;.*$/, "");
    }
    get headers() {
      return this.response.headers;
    }
    get html() {
      if (this.contentType.match(/^(application|text)\/(html|xhtml\+xml)$/)) {
        return this.text;
      }
      return Promise.reject(new Error(`Expected an HTML response but got "${this.contentType}" instead`));
    }
    get json() {
      if (this.contentType.match(/^application\/.*json$/)) {
        return this.responseJson || (this.responseJson = this.response.json());
      }
      return Promise.reject(new Error(`Expected a JSON response but got "${this.contentType}" instead`));
    }
    get text() {
      return this.responseText || (this.responseText = this.response.text());
    }
    get isTurboStream() {
      return this.contentType.match(/^text\/vnd\.turbo-stream\.html/);
    }
    async renderTurboStream() {
      if (this.isTurboStream) {
        if (window.Turbo) {
          await window.Turbo.renderStreamMessage(await this.text);
        } else {
          console.warn("You must set `window.Turbo = Turbo` to automatically process Turbo Stream events with request.js");
        }
      } else {
        return Promise.reject(new Error(`Expected a Turbo Stream response but got "${this.contentType}" instead`));
      }
    }
  };

  // node_modules/@rails/request.js/src/request_interceptor.js
  var RequestInterceptor = class {
    static register(interceptor) {
      this.interceptor = interceptor;
    }
    static get() {
      return this.interceptor;
    }
    static reset() {
      this.interceptor = void 0;
    }
  };

  // node_modules/@rails/request.js/src/lib/utils.js
  function getCookie(name) {
    const cookies = document.cookie ? document.cookie.split("; ") : [];
    const prefix = `${encodeURIComponent(name)}=`;
    const cookie = cookies.find((cookie2) => cookie2.startsWith(prefix));
    if (cookie) {
      const value = cookie.split("=").slice(1).join("=");
      if (value) {
        return decodeURIComponent(value);
      }
    }
  }
  function compact(object) {
    const result = {};
    for (const key in object) {
      const value = object[key];
      if (value !== void 0) {
        result[key] = value;
      }
    }
    return result;
  }
  function metaContent(name) {
    const element = document.head.querySelector(`meta[name="${name}"]`);
    return element && element.content;
  }
  function stringEntriesFromFormData(formData) {
    return [...formData].reduce((entries, [name, value]) => {
      return entries.concat(typeof value === "string" ? [[name, value]] : []);
    }, []);
  }
  function mergeEntries(searchParams, entries) {
    for (const [name, value] of entries) {
      if (value instanceof window.File)
        continue;
      if (searchParams.has(name) && !name.includes("[]")) {
        searchParams.delete(name);
        searchParams.set(name, value);
      } else {
        searchParams.append(name, value);
      }
    }
  }

  // node_modules/@rails/request.js/src/fetch_request.js
  var FetchRequest2 = class {
    constructor(method, url, options = {}) {
      this.method = method;
      this.options = options;
      this.originalUrl = url.toString();
    }
    async perform() {
      try {
        const requestInterceptor = RequestInterceptor.get();
        if (requestInterceptor) {
          await requestInterceptor(this);
        }
      } catch (error2) {
        console.error(error2);
      }
      const response = new FetchResponse2(await window.fetch(this.url, this.fetchOptions));
      if (response.unauthenticated && response.authenticationURL) {
        return Promise.reject(window.location.href = response.authenticationURL);
      }
      if (response.ok && response.isTurboStream) {
        await response.renderTurboStream();
      }
      return response;
    }
    addHeader(key, value) {
      const headers = this.additionalHeaders;
      headers[key] = value;
      this.options.headers = headers;
    }
    sameHostname() {
      if (!this.originalUrl.startsWith("http:")) {
        return true;
      }
      try {
        return new URL(this.originalUrl).hostname === window.location.hostname;
      } catch (_) {
        return true;
      }
    }
    get fetchOptions() {
      return {
        method: this.method.toUpperCase(),
        headers: this.headers,
        body: this.formattedBody,
        signal: this.signal,
        credentials: "same-origin",
        redirect: this.redirect
      };
    }
    get headers() {
      const baseHeaders = {
        "X-Requested-With": "XMLHttpRequest",
        "Content-Type": this.contentType,
        Accept: this.accept
      };
      if (this.sameHostname()) {
        baseHeaders["X-CSRF-Token"] = this.csrfToken;
      }
      return compact(
        Object.assign(baseHeaders, this.additionalHeaders)
      );
    }
    get csrfToken() {
      return getCookie(metaContent("csrf-param")) || metaContent("csrf-token");
    }
    get contentType() {
      if (this.options.contentType) {
        return this.options.contentType;
      } else if (this.body == null || this.body instanceof window.FormData) {
        return void 0;
      } else if (this.body instanceof window.File) {
        return this.body.type;
      }
      return "application/json";
    }
    get accept() {
      switch (this.responseKind) {
        case "html":
          return "text/html, application/xhtml+xml";
        case "turbo-stream":
          return "text/vnd.turbo-stream.html, text/html, application/xhtml+xml";
        case "json":
          return "application/json, application/vnd.api+json";
        default:
          return "*/*";
      }
    }
    get body() {
      return this.options.body;
    }
    get query() {
      const originalQuery = (this.originalUrl.split("?")[1] || "").split("#")[0];
      const params = new URLSearchParams(originalQuery);
      let requestQuery = this.options.query;
      if (requestQuery instanceof window.FormData) {
        requestQuery = stringEntriesFromFormData(requestQuery);
      } else if (requestQuery instanceof window.URLSearchParams) {
        requestQuery = requestQuery.entries();
      } else {
        requestQuery = Object.entries(requestQuery || {});
      }
      mergeEntries(params, requestQuery);
      const query = params.toString();
      return query.length > 0 ? `?${query}` : "";
    }
    get url() {
      return this.originalUrl.split("?")[0].split("#")[0] + this.query;
    }
    get responseKind() {
      return this.options.responseKind || "html";
    }
    get signal() {
      return this.options.signal;
    }
    get redirect() {
      return this.options.redirect || "follow";
    }
    get additionalHeaders() {
      return this.options.headers || {};
    }
    get formattedBody() {
      const bodyIsAString = Object.prototype.toString.call(this.body) === "[object String]";
      const contentTypeIsJson = this.headers["Content-Type"] === "application/json";
      if (contentTypeIsJson && !bodyIsAString) {
        return JSON.stringify(this.body);
      }
      return this.body;
    }
  };

  // node_modules/@rails/request.js/src/verbs.js
  async function get(url, options) {
    const request = new FetchRequest2("get", url, options);
    return request.perform();
  }
  async function post(url, options) {
    const request = new FetchRequest2("post", url, options);
    return request.perform();
  }

  // node_modules/@hotwired/stimulus/dist/stimulus.js
  var EventListener = class {
    constructor(eventTarget, eventName, eventOptions) {
      this.eventTarget = eventTarget;
      this.eventName = eventName;
      this.eventOptions = eventOptions;
      this.unorderedBindings = /* @__PURE__ */ new Set();
    }
    connect() {
      this.eventTarget.addEventListener(this.eventName, this, this.eventOptions);
    }
    disconnect() {
      this.eventTarget.removeEventListener(this.eventName, this, this.eventOptions);
    }
    bindingConnected(binding) {
      this.unorderedBindings.add(binding);
    }
    bindingDisconnected(binding) {
      this.unorderedBindings.delete(binding);
    }
    handleEvent(event) {
      const extendedEvent = extendEvent(event);
      for (const binding of this.bindings) {
        if (extendedEvent.immediatePropagationStopped) {
          break;
        } else {
          binding.handleEvent(extendedEvent);
        }
      }
    }
    hasBindings() {
      return this.unorderedBindings.size > 0;
    }
    get bindings() {
      return Array.from(this.unorderedBindings).sort((left, right) => {
        const leftIndex = left.index, rightIndex = right.index;
        return leftIndex < rightIndex ? -1 : leftIndex > rightIndex ? 1 : 0;
      });
    }
  };
  function extendEvent(event) {
    if ("immediatePropagationStopped" in event) {
      return event;
    } else {
      const { stopImmediatePropagation } = event;
      return Object.assign(event, {
        immediatePropagationStopped: false,
        stopImmediatePropagation() {
          this.immediatePropagationStopped = true;
          stopImmediatePropagation.call(this);
        }
      });
    }
  }
  var Dispatcher = class {
    constructor(application2) {
      this.application = application2;
      this.eventListenerMaps = /* @__PURE__ */ new Map();
      this.started = false;
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.eventListeners.forEach((eventListener) => eventListener.connect());
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        this.eventListeners.forEach((eventListener) => eventListener.disconnect());
      }
    }
    get eventListeners() {
      return Array.from(this.eventListenerMaps.values()).reduce((listeners, map) => listeners.concat(Array.from(map.values())), []);
    }
    bindingConnected(binding) {
      this.fetchEventListenerForBinding(binding).bindingConnected(binding);
    }
    bindingDisconnected(binding, clearEventListeners = false) {
      this.fetchEventListenerForBinding(binding).bindingDisconnected(binding);
      if (clearEventListeners)
        this.clearEventListenersForBinding(binding);
    }
    handleError(error2, message, detail = {}) {
      this.application.handleError(error2, `Error ${message}`, detail);
    }
    clearEventListenersForBinding(binding) {
      const eventListener = this.fetchEventListenerForBinding(binding);
      if (!eventListener.hasBindings()) {
        eventListener.disconnect();
        this.removeMappedEventListenerFor(binding);
      }
    }
    removeMappedEventListenerFor(binding) {
      const { eventTarget, eventName, eventOptions } = binding;
      const eventListenerMap = this.fetchEventListenerMapForEventTarget(eventTarget);
      const cacheKey = this.cacheKey(eventName, eventOptions);
      eventListenerMap.delete(cacheKey);
      if (eventListenerMap.size == 0)
        this.eventListenerMaps.delete(eventTarget);
    }
    fetchEventListenerForBinding(binding) {
      const { eventTarget, eventName, eventOptions } = binding;
      return this.fetchEventListener(eventTarget, eventName, eventOptions);
    }
    fetchEventListener(eventTarget, eventName, eventOptions) {
      const eventListenerMap = this.fetchEventListenerMapForEventTarget(eventTarget);
      const cacheKey = this.cacheKey(eventName, eventOptions);
      let eventListener = eventListenerMap.get(cacheKey);
      if (!eventListener) {
        eventListener = this.createEventListener(eventTarget, eventName, eventOptions);
        eventListenerMap.set(cacheKey, eventListener);
      }
      return eventListener;
    }
    createEventListener(eventTarget, eventName, eventOptions) {
      const eventListener = new EventListener(eventTarget, eventName, eventOptions);
      if (this.started) {
        eventListener.connect();
      }
      return eventListener;
    }
    fetchEventListenerMapForEventTarget(eventTarget) {
      let eventListenerMap = this.eventListenerMaps.get(eventTarget);
      if (!eventListenerMap) {
        eventListenerMap = /* @__PURE__ */ new Map();
        this.eventListenerMaps.set(eventTarget, eventListenerMap);
      }
      return eventListenerMap;
    }
    cacheKey(eventName, eventOptions) {
      const parts = [eventName];
      Object.keys(eventOptions).sort().forEach((key) => {
        parts.push(`${eventOptions[key] ? "" : "!"}${key}`);
      });
      return parts.join(":");
    }
  };
  var defaultActionDescriptorFilters = {
    stop({ event, value }) {
      if (value)
        event.stopPropagation();
      return true;
    },
    prevent({ event, value }) {
      if (value)
        event.preventDefault();
      return true;
    },
    self({ event, value, element }) {
      if (value) {
        return element === event.target;
      } else {
        return true;
      }
    }
  };
  var descriptorPattern = /^(?:(.+?)(?:\.(.+?))?(?:@(window|document))?->)?(.+?)(?:#([^:]+?))(?::(.+))?$/;
  function parseActionDescriptorString(descriptorString) {
    const source = descriptorString.trim();
    const matches = source.match(descriptorPattern) || [];
    let eventName = matches[1];
    let keyFilter = matches[2];
    if (keyFilter && !["keydown", "keyup", "keypress"].includes(eventName)) {
      eventName += `.${keyFilter}`;
      keyFilter = "";
    }
    return {
      eventTarget: parseEventTarget(matches[3]),
      eventName,
      eventOptions: matches[6] ? parseEventOptions(matches[6]) : {},
      identifier: matches[4],
      methodName: matches[5],
      keyFilter
    };
  }
  function parseEventTarget(eventTargetName) {
    if (eventTargetName == "window") {
      return window;
    } else if (eventTargetName == "document") {
      return document;
    }
  }
  function parseEventOptions(eventOptions) {
    return eventOptions.split(":").reduce((options, token) => Object.assign(options, { [token.replace(/^!/, "")]: !/^!/.test(token) }), {});
  }
  function stringifyEventTarget(eventTarget) {
    if (eventTarget == window) {
      return "window";
    } else if (eventTarget == document) {
      return "document";
    }
  }
  function camelize(value) {
    return value.replace(/(?:[_-])([a-z0-9])/g, (_, char) => char.toUpperCase());
  }
  function namespaceCamelize(value) {
    return camelize(value.replace(/--/g, "-").replace(/__/g, "_"));
  }
  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
  function dasherize(value) {
    return value.replace(/([A-Z])/g, (_, char) => `-${char.toLowerCase()}`);
  }
  function tokenize(value) {
    return value.match(/[^\s]+/g) || [];
  }
  var Action = class {
    constructor(element, index, descriptor, schema) {
      this.element = element;
      this.index = index;
      this.eventTarget = descriptor.eventTarget || element;
      this.eventName = descriptor.eventName || getDefaultEventNameForElement(element) || error("missing event name");
      this.eventOptions = descriptor.eventOptions || {};
      this.identifier = descriptor.identifier || error("missing identifier");
      this.methodName = descriptor.methodName || error("missing method name");
      this.keyFilter = descriptor.keyFilter || "";
      this.schema = schema;
    }
    static forToken(token, schema) {
      return new this(token.element, token.index, parseActionDescriptorString(token.content), schema);
    }
    toString() {
      const eventFilter = this.keyFilter ? `.${this.keyFilter}` : "";
      const eventTarget = this.eventTargetName ? `@${this.eventTargetName}` : "";
      return `${this.eventName}${eventFilter}${eventTarget}->${this.identifier}#${this.methodName}`;
    }
    isFilterTarget(event) {
      if (!this.keyFilter) {
        return false;
      }
      const filteres = this.keyFilter.split("+");
      const modifiers = ["meta", "ctrl", "alt", "shift"];
      const [meta, ctrl, alt, shift] = modifiers.map((modifier) => filteres.includes(modifier));
      if (event.metaKey !== meta || event.ctrlKey !== ctrl || event.altKey !== alt || event.shiftKey !== shift) {
        return true;
      }
      const standardFilter = filteres.filter((key) => !modifiers.includes(key))[0];
      if (!standardFilter) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(this.keyMappings, standardFilter)) {
        error(`contains unknown key filter: ${this.keyFilter}`);
      }
      return this.keyMappings[standardFilter].toLowerCase() !== event.key.toLowerCase();
    }
    get params() {
      const params = {};
      const pattern = new RegExp(`^data-${this.identifier}-(.+)-param$`, "i");
      for (const { name, value } of Array.from(this.element.attributes)) {
        const match = name.match(pattern);
        const key = match && match[1];
        if (key) {
          params[camelize(key)] = typecast(value);
        }
      }
      return params;
    }
    get eventTargetName() {
      return stringifyEventTarget(this.eventTarget);
    }
    get keyMappings() {
      return this.schema.keyMappings;
    }
  };
  var defaultEventNames = {
    a: () => "click",
    button: () => "click",
    form: () => "submit",
    details: () => "toggle",
    input: (e) => e.getAttribute("type") == "submit" ? "click" : "input",
    select: () => "change",
    textarea: () => "input"
  };
  function getDefaultEventNameForElement(element) {
    const tagName = element.tagName.toLowerCase();
    if (tagName in defaultEventNames) {
      return defaultEventNames[tagName](element);
    }
  }
  function error(message) {
    throw new Error(message);
  }
  function typecast(value) {
    try {
      return JSON.parse(value);
    } catch (o_O) {
      return value;
    }
  }
  var Binding = class {
    constructor(context, action) {
      this.context = context;
      this.action = action;
    }
    get index() {
      return this.action.index;
    }
    get eventTarget() {
      return this.action.eventTarget;
    }
    get eventOptions() {
      return this.action.eventOptions;
    }
    get identifier() {
      return this.context.identifier;
    }
    handleEvent(event) {
      if (this.willBeInvokedByEvent(event) && this.applyEventModifiers(event)) {
        this.invokeWithEvent(event);
      }
    }
    get eventName() {
      return this.action.eventName;
    }
    get method() {
      const method = this.controller[this.methodName];
      if (typeof method == "function") {
        return method;
      }
      throw new Error(`Action "${this.action}" references undefined method "${this.methodName}"`);
    }
    applyEventModifiers(event) {
      const { element } = this.action;
      const { actionDescriptorFilters } = this.context.application;
      let passes = true;
      for (const [name, value] of Object.entries(this.eventOptions)) {
        if (name in actionDescriptorFilters) {
          const filter2 = actionDescriptorFilters[name];
          passes = passes && filter2({ name, value, event, element });
        } else {
          continue;
        }
      }
      return passes;
    }
    invokeWithEvent(event) {
      const { target, currentTarget } = event;
      try {
        const { params } = this.action;
        const actionEvent = Object.assign(event, { params });
        this.method.call(this.controller, actionEvent);
        this.context.logDebugActivity(this.methodName, { event, target, currentTarget, action: this.methodName });
      } catch (error2) {
        const { identifier, controller, element, index } = this;
        const detail = { identifier, controller, element, index, event };
        this.context.handleError(error2, `invoking action "${this.action}"`, detail);
      }
    }
    willBeInvokedByEvent(event) {
      const eventTarget = event.target;
      if (event instanceof KeyboardEvent && this.action.isFilterTarget(event)) {
        return false;
      }
      if (this.element === eventTarget) {
        return true;
      } else if (eventTarget instanceof Element && this.element.contains(eventTarget)) {
        return this.scope.containsElement(eventTarget);
      } else {
        return this.scope.containsElement(this.action.element);
      }
    }
    get controller() {
      return this.context.controller;
    }
    get methodName() {
      return this.action.methodName;
    }
    get element() {
      return this.scope.element;
    }
    get scope() {
      return this.context.scope;
    }
  };
  var ElementObserver = class {
    constructor(element, delegate) {
      this.mutationObserverInit = { attributes: true, childList: true, subtree: true };
      this.element = element;
      this.started = false;
      this.delegate = delegate;
      this.elements = /* @__PURE__ */ new Set();
      this.mutationObserver = new MutationObserver((mutations) => this.processMutations(mutations));
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.mutationObserver.observe(this.element, this.mutationObserverInit);
        this.refresh();
      }
    }
    pause(callback) {
      if (this.started) {
        this.mutationObserver.disconnect();
        this.started = false;
      }
      callback();
      if (!this.started) {
        this.mutationObserver.observe(this.element, this.mutationObserverInit);
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        this.mutationObserver.takeRecords();
        this.mutationObserver.disconnect();
        this.started = false;
      }
    }
    refresh() {
      if (this.started) {
        const matches = new Set(this.matchElementsInTree());
        for (const element of Array.from(this.elements)) {
          if (!matches.has(element)) {
            this.removeElement(element);
          }
        }
        for (const element of Array.from(matches)) {
          this.addElement(element);
        }
      }
    }
    processMutations(mutations) {
      if (this.started) {
        for (const mutation of mutations) {
          this.processMutation(mutation);
        }
      }
    }
    processMutation(mutation) {
      if (mutation.type == "attributes") {
        this.processAttributeChange(mutation.target, mutation.attributeName);
      } else if (mutation.type == "childList") {
        this.processRemovedNodes(mutation.removedNodes);
        this.processAddedNodes(mutation.addedNodes);
      }
    }
    processAttributeChange(node, attributeName) {
      const element = node;
      if (this.elements.has(element)) {
        if (this.delegate.elementAttributeChanged && this.matchElement(element)) {
          this.delegate.elementAttributeChanged(element, attributeName);
        } else {
          this.removeElement(element);
        }
      } else if (this.matchElement(element)) {
        this.addElement(element);
      }
    }
    processRemovedNodes(nodes) {
      for (const node of Array.from(nodes)) {
        const element = this.elementFromNode(node);
        if (element) {
          this.processTree(element, this.removeElement);
        }
      }
    }
    processAddedNodes(nodes) {
      for (const node of Array.from(nodes)) {
        const element = this.elementFromNode(node);
        if (element && this.elementIsActive(element)) {
          this.processTree(element, this.addElement);
        }
      }
    }
    matchElement(element) {
      return this.delegate.matchElement(element);
    }
    matchElementsInTree(tree = this.element) {
      return this.delegate.matchElementsInTree(tree);
    }
    processTree(tree, processor) {
      for (const element of this.matchElementsInTree(tree)) {
        processor.call(this, element);
      }
    }
    elementFromNode(node) {
      if (node.nodeType == Node.ELEMENT_NODE) {
        return node;
      }
    }
    elementIsActive(element) {
      if (element.isConnected != this.element.isConnected) {
        return false;
      } else {
        return this.element.contains(element);
      }
    }
    addElement(element) {
      if (!this.elements.has(element)) {
        if (this.elementIsActive(element)) {
          this.elements.add(element);
          if (this.delegate.elementMatched) {
            this.delegate.elementMatched(element);
          }
        }
      }
    }
    removeElement(element) {
      if (this.elements.has(element)) {
        this.elements.delete(element);
        if (this.delegate.elementUnmatched) {
          this.delegate.elementUnmatched(element);
        }
      }
    }
  };
  var AttributeObserver = class {
    constructor(element, attributeName, delegate) {
      this.attributeName = attributeName;
      this.delegate = delegate;
      this.elementObserver = new ElementObserver(element, this);
    }
    get element() {
      return this.elementObserver.element;
    }
    get selector() {
      return `[${this.attributeName}]`;
    }
    start() {
      this.elementObserver.start();
    }
    pause(callback) {
      this.elementObserver.pause(callback);
    }
    stop() {
      this.elementObserver.stop();
    }
    refresh() {
      this.elementObserver.refresh();
    }
    get started() {
      return this.elementObserver.started;
    }
    matchElement(element) {
      return element.hasAttribute(this.attributeName);
    }
    matchElementsInTree(tree) {
      const match = this.matchElement(tree) ? [tree] : [];
      const matches = Array.from(tree.querySelectorAll(this.selector));
      return match.concat(matches);
    }
    elementMatched(element) {
      if (this.delegate.elementMatchedAttribute) {
        this.delegate.elementMatchedAttribute(element, this.attributeName);
      }
    }
    elementUnmatched(element) {
      if (this.delegate.elementUnmatchedAttribute) {
        this.delegate.elementUnmatchedAttribute(element, this.attributeName);
      }
    }
    elementAttributeChanged(element, attributeName) {
      if (this.delegate.elementAttributeValueChanged && this.attributeName == attributeName) {
        this.delegate.elementAttributeValueChanged(element, attributeName);
      }
    }
  };
  function add(map, key, value) {
    fetch2(map, key).add(value);
  }
  function del(map, key, value) {
    fetch2(map, key).delete(value);
    prune(map, key);
  }
  function fetch2(map, key) {
    let values = map.get(key);
    if (!values) {
      values = /* @__PURE__ */ new Set();
      map.set(key, values);
    }
    return values;
  }
  function prune(map, key) {
    const values = map.get(key);
    if (values != null && values.size == 0) {
      map.delete(key);
    }
  }
  var Multimap = class {
    constructor() {
      this.valuesByKey = /* @__PURE__ */ new Map();
    }
    get keys() {
      return Array.from(this.valuesByKey.keys());
    }
    get values() {
      const sets = Array.from(this.valuesByKey.values());
      return sets.reduce((values, set) => values.concat(Array.from(set)), []);
    }
    get size() {
      const sets = Array.from(this.valuesByKey.values());
      return sets.reduce((size, set) => size + set.size, 0);
    }
    add(key, value) {
      add(this.valuesByKey, key, value);
    }
    delete(key, value) {
      del(this.valuesByKey, key, value);
    }
    has(key, value) {
      const values = this.valuesByKey.get(key);
      return values != null && values.has(value);
    }
    hasKey(key) {
      return this.valuesByKey.has(key);
    }
    hasValue(value) {
      const sets = Array.from(this.valuesByKey.values());
      return sets.some((set) => set.has(value));
    }
    getValuesForKey(key) {
      const values = this.valuesByKey.get(key);
      return values ? Array.from(values) : [];
    }
    getKeysForValue(value) {
      return Array.from(this.valuesByKey).filter(([_key, values]) => values.has(value)).map(([key, _values]) => key);
    }
  };
  var SelectorObserver = class {
    constructor(element, selector, delegate, details = {}) {
      this.selector = selector;
      this.details = details;
      this.elementObserver = new ElementObserver(element, this);
      this.delegate = delegate;
      this.matchesByElement = new Multimap();
    }
    get started() {
      return this.elementObserver.started;
    }
    start() {
      this.elementObserver.start();
    }
    pause(callback) {
      this.elementObserver.pause(callback);
    }
    stop() {
      this.elementObserver.stop();
    }
    refresh() {
      this.elementObserver.refresh();
    }
    get element() {
      return this.elementObserver.element;
    }
    matchElement(element) {
      const matches = element.matches(this.selector);
      if (this.delegate.selectorMatchElement) {
        return matches && this.delegate.selectorMatchElement(element, this.details);
      }
      return matches;
    }
    matchElementsInTree(tree) {
      const match = this.matchElement(tree) ? [tree] : [];
      const matches = Array.from(tree.querySelectorAll(this.selector)).filter((match2) => this.matchElement(match2));
      return match.concat(matches);
    }
    elementMatched(element) {
      this.selectorMatched(element);
    }
    elementUnmatched(element) {
      this.selectorUnmatched(element);
    }
    elementAttributeChanged(element, _attributeName) {
      const matches = this.matchElement(element);
      const matchedBefore = this.matchesByElement.has(this.selector, element);
      if (!matches && matchedBefore) {
        this.selectorUnmatched(element);
      }
    }
    selectorMatched(element) {
      if (this.delegate.selectorMatched) {
        this.delegate.selectorMatched(element, this.selector, this.details);
        this.matchesByElement.add(this.selector, element);
      }
    }
    selectorUnmatched(element) {
      this.delegate.selectorUnmatched(element, this.selector, this.details);
      this.matchesByElement.delete(this.selector, element);
    }
  };
  var StringMapObserver = class {
    constructor(element, delegate) {
      this.element = element;
      this.delegate = delegate;
      this.started = false;
      this.stringMap = /* @__PURE__ */ new Map();
      this.mutationObserver = new MutationObserver((mutations) => this.processMutations(mutations));
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.mutationObserver.observe(this.element, { attributes: true, attributeOldValue: true });
        this.refresh();
      }
    }
    stop() {
      if (this.started) {
        this.mutationObserver.takeRecords();
        this.mutationObserver.disconnect();
        this.started = false;
      }
    }
    refresh() {
      if (this.started) {
        for (const attributeName of this.knownAttributeNames) {
          this.refreshAttribute(attributeName, null);
        }
      }
    }
    processMutations(mutations) {
      if (this.started) {
        for (const mutation of mutations) {
          this.processMutation(mutation);
        }
      }
    }
    processMutation(mutation) {
      const attributeName = mutation.attributeName;
      if (attributeName) {
        this.refreshAttribute(attributeName, mutation.oldValue);
      }
    }
    refreshAttribute(attributeName, oldValue) {
      const key = this.delegate.getStringMapKeyForAttribute(attributeName);
      if (key != null) {
        if (!this.stringMap.has(attributeName)) {
          this.stringMapKeyAdded(key, attributeName);
        }
        const value = this.element.getAttribute(attributeName);
        if (this.stringMap.get(attributeName) != value) {
          this.stringMapValueChanged(value, key, oldValue);
        }
        if (value == null) {
          const oldValue2 = this.stringMap.get(attributeName);
          this.stringMap.delete(attributeName);
          if (oldValue2)
            this.stringMapKeyRemoved(key, attributeName, oldValue2);
        } else {
          this.stringMap.set(attributeName, value);
        }
      }
    }
    stringMapKeyAdded(key, attributeName) {
      if (this.delegate.stringMapKeyAdded) {
        this.delegate.stringMapKeyAdded(key, attributeName);
      }
    }
    stringMapValueChanged(value, key, oldValue) {
      if (this.delegate.stringMapValueChanged) {
        this.delegate.stringMapValueChanged(value, key, oldValue);
      }
    }
    stringMapKeyRemoved(key, attributeName, oldValue) {
      if (this.delegate.stringMapKeyRemoved) {
        this.delegate.stringMapKeyRemoved(key, attributeName, oldValue);
      }
    }
    get knownAttributeNames() {
      return Array.from(new Set(this.currentAttributeNames.concat(this.recordedAttributeNames)));
    }
    get currentAttributeNames() {
      return Array.from(this.element.attributes).map((attribute) => attribute.name);
    }
    get recordedAttributeNames() {
      return Array.from(this.stringMap.keys());
    }
  };
  var TokenListObserver = class {
    constructor(element, attributeName, delegate) {
      this.attributeObserver = new AttributeObserver(element, attributeName, this);
      this.delegate = delegate;
      this.tokensByElement = new Multimap();
    }
    get started() {
      return this.attributeObserver.started;
    }
    start() {
      this.attributeObserver.start();
    }
    pause(callback) {
      this.attributeObserver.pause(callback);
    }
    stop() {
      this.attributeObserver.stop();
    }
    refresh() {
      this.attributeObserver.refresh();
    }
    get element() {
      return this.attributeObserver.element;
    }
    get attributeName() {
      return this.attributeObserver.attributeName;
    }
    elementMatchedAttribute(element) {
      this.tokensMatched(this.readTokensForElement(element));
    }
    elementAttributeValueChanged(element) {
      const [unmatchedTokens, matchedTokens] = this.refreshTokensForElement(element);
      this.tokensUnmatched(unmatchedTokens);
      this.tokensMatched(matchedTokens);
    }
    elementUnmatchedAttribute(element) {
      this.tokensUnmatched(this.tokensByElement.getValuesForKey(element));
    }
    tokensMatched(tokens) {
      tokens.forEach((token) => this.tokenMatched(token));
    }
    tokensUnmatched(tokens) {
      tokens.forEach((token) => this.tokenUnmatched(token));
    }
    tokenMatched(token) {
      this.delegate.tokenMatched(token);
      this.tokensByElement.add(token.element, token);
    }
    tokenUnmatched(token) {
      this.delegate.tokenUnmatched(token);
      this.tokensByElement.delete(token.element, token);
    }
    refreshTokensForElement(element) {
      const previousTokens = this.tokensByElement.getValuesForKey(element);
      const currentTokens = this.readTokensForElement(element);
      const firstDifferingIndex = zip(previousTokens, currentTokens).findIndex(([previousToken, currentToken]) => !tokensAreEqual(previousToken, currentToken));
      if (firstDifferingIndex == -1) {
        return [[], []];
      } else {
        return [previousTokens.slice(firstDifferingIndex), currentTokens.slice(firstDifferingIndex)];
      }
    }
    readTokensForElement(element) {
      const attributeName = this.attributeName;
      const tokenString = element.getAttribute(attributeName) || "";
      return parseTokenString(tokenString, element, attributeName);
    }
  };
  function parseTokenString(tokenString, element, attributeName) {
    return tokenString.trim().split(/\s+/).filter((content) => content.length).map((content, index) => ({ element, attributeName, content, index }));
  }
  function zip(left, right) {
    const length = Math.max(left.length, right.length);
    return Array.from({ length }, (_, index) => [left[index], right[index]]);
  }
  function tokensAreEqual(left, right) {
    return left && right && left.index == right.index && left.content == right.content;
  }
  var ValueListObserver = class {
    constructor(element, attributeName, delegate) {
      this.tokenListObserver = new TokenListObserver(element, attributeName, this);
      this.delegate = delegate;
      this.parseResultsByToken = /* @__PURE__ */ new WeakMap();
      this.valuesByTokenByElement = /* @__PURE__ */ new WeakMap();
    }
    get started() {
      return this.tokenListObserver.started;
    }
    start() {
      this.tokenListObserver.start();
    }
    stop() {
      this.tokenListObserver.stop();
    }
    refresh() {
      this.tokenListObserver.refresh();
    }
    get element() {
      return this.tokenListObserver.element;
    }
    get attributeName() {
      return this.tokenListObserver.attributeName;
    }
    tokenMatched(token) {
      const { element } = token;
      const { value } = this.fetchParseResultForToken(token);
      if (value) {
        this.fetchValuesByTokenForElement(element).set(token, value);
        this.delegate.elementMatchedValue(element, value);
      }
    }
    tokenUnmatched(token) {
      const { element } = token;
      const { value } = this.fetchParseResultForToken(token);
      if (value) {
        this.fetchValuesByTokenForElement(element).delete(token);
        this.delegate.elementUnmatchedValue(element, value);
      }
    }
    fetchParseResultForToken(token) {
      let parseResult = this.parseResultsByToken.get(token);
      if (!parseResult) {
        parseResult = this.parseToken(token);
        this.parseResultsByToken.set(token, parseResult);
      }
      return parseResult;
    }
    fetchValuesByTokenForElement(element) {
      let valuesByToken = this.valuesByTokenByElement.get(element);
      if (!valuesByToken) {
        valuesByToken = /* @__PURE__ */ new Map();
        this.valuesByTokenByElement.set(element, valuesByToken);
      }
      return valuesByToken;
    }
    parseToken(token) {
      try {
        const value = this.delegate.parseValueForToken(token);
        return { value };
      } catch (error2) {
        return { error: error2 };
      }
    }
  };
  var BindingObserver = class {
    constructor(context, delegate) {
      this.context = context;
      this.delegate = delegate;
      this.bindingsByAction = /* @__PURE__ */ new Map();
    }
    start() {
      if (!this.valueListObserver) {
        this.valueListObserver = new ValueListObserver(this.element, this.actionAttribute, this);
        this.valueListObserver.start();
      }
    }
    stop() {
      if (this.valueListObserver) {
        this.valueListObserver.stop();
        delete this.valueListObserver;
        this.disconnectAllActions();
      }
    }
    get element() {
      return this.context.element;
    }
    get identifier() {
      return this.context.identifier;
    }
    get actionAttribute() {
      return this.schema.actionAttribute;
    }
    get schema() {
      return this.context.schema;
    }
    get bindings() {
      return Array.from(this.bindingsByAction.values());
    }
    connectAction(action) {
      const binding = new Binding(this.context, action);
      this.bindingsByAction.set(action, binding);
      this.delegate.bindingConnected(binding);
    }
    disconnectAction(action) {
      const binding = this.bindingsByAction.get(action);
      if (binding) {
        this.bindingsByAction.delete(action);
        this.delegate.bindingDisconnected(binding);
      }
    }
    disconnectAllActions() {
      this.bindings.forEach((binding) => this.delegate.bindingDisconnected(binding, true));
      this.bindingsByAction.clear();
    }
    parseValueForToken(token) {
      const action = Action.forToken(token, this.schema);
      if (action.identifier == this.identifier) {
        return action;
      }
    }
    elementMatchedValue(element, action) {
      this.connectAction(action);
    }
    elementUnmatchedValue(element, action) {
      this.disconnectAction(action);
    }
  };
  var ValueObserver = class {
    constructor(context, receiver) {
      this.context = context;
      this.receiver = receiver;
      this.stringMapObserver = new StringMapObserver(this.element, this);
      this.valueDescriptorMap = this.controller.valueDescriptorMap;
    }
    start() {
      this.stringMapObserver.start();
      this.invokeChangedCallbacksForDefaultValues();
    }
    stop() {
      this.stringMapObserver.stop();
    }
    get element() {
      return this.context.element;
    }
    get controller() {
      return this.context.controller;
    }
    getStringMapKeyForAttribute(attributeName) {
      if (attributeName in this.valueDescriptorMap) {
        return this.valueDescriptorMap[attributeName].name;
      }
    }
    stringMapKeyAdded(key, attributeName) {
      const descriptor = this.valueDescriptorMap[attributeName];
      if (!this.hasValue(key)) {
        this.invokeChangedCallback(key, descriptor.writer(this.receiver[key]), descriptor.writer(descriptor.defaultValue));
      }
    }
    stringMapValueChanged(value, name, oldValue) {
      const descriptor = this.valueDescriptorNameMap[name];
      if (value === null)
        return;
      if (oldValue === null) {
        oldValue = descriptor.writer(descriptor.defaultValue);
      }
      this.invokeChangedCallback(name, value, oldValue);
    }
    stringMapKeyRemoved(key, attributeName, oldValue) {
      const descriptor = this.valueDescriptorNameMap[key];
      if (this.hasValue(key)) {
        this.invokeChangedCallback(key, descriptor.writer(this.receiver[key]), oldValue);
      } else {
        this.invokeChangedCallback(key, descriptor.writer(descriptor.defaultValue), oldValue);
      }
    }
    invokeChangedCallbacksForDefaultValues() {
      for (const { key, name, defaultValue, writer } of this.valueDescriptors) {
        if (defaultValue != void 0 && !this.controller.data.has(key)) {
          this.invokeChangedCallback(name, writer(defaultValue), void 0);
        }
      }
    }
    invokeChangedCallback(name, rawValue, rawOldValue) {
      const changedMethodName = `${name}Changed`;
      const changedMethod = this.receiver[changedMethodName];
      if (typeof changedMethod == "function") {
        const descriptor = this.valueDescriptorNameMap[name];
        try {
          const value = descriptor.reader(rawValue);
          let oldValue = rawOldValue;
          if (rawOldValue) {
            oldValue = descriptor.reader(rawOldValue);
          }
          changedMethod.call(this.receiver, value, oldValue);
        } catch (error2) {
          if (error2 instanceof TypeError) {
            error2.message = `Stimulus Value "${this.context.identifier}.${descriptor.name}" - ${error2.message}`;
          }
          throw error2;
        }
      }
    }
    get valueDescriptors() {
      const { valueDescriptorMap } = this;
      return Object.keys(valueDescriptorMap).map((key) => valueDescriptorMap[key]);
    }
    get valueDescriptorNameMap() {
      const descriptors = {};
      Object.keys(this.valueDescriptorMap).forEach((key) => {
        const descriptor = this.valueDescriptorMap[key];
        descriptors[descriptor.name] = descriptor;
      });
      return descriptors;
    }
    hasValue(attributeName) {
      const descriptor = this.valueDescriptorNameMap[attributeName];
      const hasMethodName = `has${capitalize(descriptor.name)}`;
      return this.receiver[hasMethodName];
    }
  };
  var TargetObserver = class {
    constructor(context, delegate) {
      this.context = context;
      this.delegate = delegate;
      this.targetsByName = new Multimap();
    }
    start() {
      if (!this.tokenListObserver) {
        this.tokenListObserver = new TokenListObserver(this.element, this.attributeName, this);
        this.tokenListObserver.start();
      }
    }
    stop() {
      if (this.tokenListObserver) {
        this.disconnectAllTargets();
        this.tokenListObserver.stop();
        delete this.tokenListObserver;
      }
    }
    tokenMatched({ element, content: name }) {
      if (this.scope.containsElement(element)) {
        this.connectTarget(element, name);
      }
    }
    tokenUnmatched({ element, content: name }) {
      this.disconnectTarget(element, name);
    }
    connectTarget(element, name) {
      var _a;
      if (!this.targetsByName.has(name, element)) {
        this.targetsByName.add(name, element);
        (_a = this.tokenListObserver) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.targetConnected(element, name));
      }
    }
    disconnectTarget(element, name) {
      var _a;
      if (this.targetsByName.has(name, element)) {
        this.targetsByName.delete(name, element);
        (_a = this.tokenListObserver) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.targetDisconnected(element, name));
      }
    }
    disconnectAllTargets() {
      for (const name of this.targetsByName.keys) {
        for (const element of this.targetsByName.getValuesForKey(name)) {
          this.disconnectTarget(element, name);
        }
      }
    }
    get attributeName() {
      return `data-${this.context.identifier}-target`;
    }
    get element() {
      return this.context.element;
    }
    get scope() {
      return this.context.scope;
    }
  };
  function readInheritableStaticArrayValues(constructor, propertyName) {
    const ancestors = getAncestorsForConstructor(constructor);
    return Array.from(ancestors.reduce((values, constructor2) => {
      getOwnStaticArrayValues(constructor2, propertyName).forEach((name) => values.add(name));
      return values;
    }, /* @__PURE__ */ new Set()));
  }
  function readInheritableStaticObjectPairs(constructor, propertyName) {
    const ancestors = getAncestorsForConstructor(constructor);
    return ancestors.reduce((pairs, constructor2) => {
      pairs.push(...getOwnStaticObjectPairs(constructor2, propertyName));
      return pairs;
    }, []);
  }
  function getAncestorsForConstructor(constructor) {
    const ancestors = [];
    while (constructor) {
      ancestors.push(constructor);
      constructor = Object.getPrototypeOf(constructor);
    }
    return ancestors.reverse();
  }
  function getOwnStaticArrayValues(constructor, propertyName) {
    const definition = constructor[propertyName];
    return Array.isArray(definition) ? definition : [];
  }
  function getOwnStaticObjectPairs(constructor, propertyName) {
    const definition = constructor[propertyName];
    return definition ? Object.keys(definition).map((key) => [key, definition[key]]) : [];
  }
  var OutletObserver = class {
    constructor(context, delegate) {
      this.context = context;
      this.delegate = delegate;
      this.outletsByName = new Multimap();
      this.outletElementsByName = new Multimap();
      this.selectorObserverMap = /* @__PURE__ */ new Map();
    }
    start() {
      if (this.selectorObserverMap.size === 0) {
        this.outletDefinitions.forEach((outletName) => {
          const selector = this.selector(outletName);
          const details = { outletName };
          if (selector) {
            this.selectorObserverMap.set(outletName, new SelectorObserver(document.body, selector, this, details));
          }
        });
        this.selectorObserverMap.forEach((observer) => observer.start());
      }
      this.dependentContexts.forEach((context) => context.refresh());
    }
    stop() {
      if (this.selectorObserverMap.size > 0) {
        this.disconnectAllOutlets();
        this.selectorObserverMap.forEach((observer) => observer.stop());
        this.selectorObserverMap.clear();
      }
    }
    refresh() {
      this.selectorObserverMap.forEach((observer) => observer.refresh());
    }
    selectorMatched(element, _selector, { outletName }) {
      const outlet = this.getOutlet(element, outletName);
      if (outlet) {
        this.connectOutlet(outlet, element, outletName);
      }
    }
    selectorUnmatched(element, _selector, { outletName }) {
      const outlet = this.getOutletFromMap(element, outletName);
      if (outlet) {
        this.disconnectOutlet(outlet, element, outletName);
      }
    }
    selectorMatchElement(element, { outletName }) {
      return this.hasOutlet(element, outletName) && element.matches(`[${this.context.application.schema.controllerAttribute}~=${outletName}]`);
    }
    connectOutlet(outlet, element, outletName) {
      var _a;
      if (!this.outletElementsByName.has(outletName, element)) {
        this.outletsByName.add(outletName, outlet);
        this.outletElementsByName.add(outletName, element);
        (_a = this.selectorObserverMap.get(outletName)) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.outletConnected(outlet, element, outletName));
      }
    }
    disconnectOutlet(outlet, element, outletName) {
      var _a;
      if (this.outletElementsByName.has(outletName, element)) {
        this.outletsByName.delete(outletName, outlet);
        this.outletElementsByName.delete(outletName, element);
        (_a = this.selectorObserverMap.get(outletName)) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.outletDisconnected(outlet, element, outletName));
      }
    }
    disconnectAllOutlets() {
      for (const outletName of this.outletElementsByName.keys) {
        for (const element of this.outletElementsByName.getValuesForKey(outletName)) {
          for (const outlet of this.outletsByName.getValuesForKey(outletName)) {
            this.disconnectOutlet(outlet, element, outletName);
          }
        }
      }
    }
    selector(outletName) {
      return this.scope.outlets.getSelectorForOutletName(outletName);
    }
    get outletDependencies() {
      const dependencies = new Multimap();
      this.router.modules.forEach((module) => {
        const constructor = module.definition.controllerConstructor;
        const outlets = readInheritableStaticArrayValues(constructor, "outlets");
        outlets.forEach((outlet) => dependencies.add(outlet, module.identifier));
      });
      return dependencies;
    }
    get outletDefinitions() {
      return this.outletDependencies.getKeysForValue(this.identifier);
    }
    get dependentControllerIdentifiers() {
      return this.outletDependencies.getValuesForKey(this.identifier);
    }
    get dependentContexts() {
      const identifiers = this.dependentControllerIdentifiers;
      return this.router.contexts.filter((context) => identifiers.includes(context.identifier));
    }
    hasOutlet(element, outletName) {
      return !!this.getOutlet(element, outletName) || !!this.getOutletFromMap(element, outletName);
    }
    getOutlet(element, outletName) {
      return this.application.getControllerForElementAndIdentifier(element, outletName);
    }
    getOutletFromMap(element, outletName) {
      return this.outletsByName.getValuesForKey(outletName).find((outlet) => outlet.element === element);
    }
    get scope() {
      return this.context.scope;
    }
    get identifier() {
      return this.context.identifier;
    }
    get application() {
      return this.context.application;
    }
    get router() {
      return this.application.router;
    }
  };
  var Context = class {
    constructor(module, scope) {
      this.logDebugActivity = (functionName, detail = {}) => {
        const { identifier, controller, element } = this;
        detail = Object.assign({ identifier, controller, element }, detail);
        this.application.logDebugActivity(this.identifier, functionName, detail);
      };
      this.module = module;
      this.scope = scope;
      this.controller = new module.controllerConstructor(this);
      this.bindingObserver = new BindingObserver(this, this.dispatcher);
      this.valueObserver = new ValueObserver(this, this.controller);
      this.targetObserver = new TargetObserver(this, this);
      this.outletObserver = new OutletObserver(this, this);
      try {
        this.controller.initialize();
        this.logDebugActivity("initialize");
      } catch (error2) {
        this.handleError(error2, "initializing controller");
      }
    }
    connect() {
      this.bindingObserver.start();
      this.valueObserver.start();
      this.targetObserver.start();
      this.outletObserver.start();
      try {
        this.controller.connect();
        this.logDebugActivity("connect");
      } catch (error2) {
        this.handleError(error2, "connecting controller");
      }
    }
    refresh() {
      this.outletObserver.refresh();
    }
    disconnect() {
      try {
        this.controller.disconnect();
        this.logDebugActivity("disconnect");
      } catch (error2) {
        this.handleError(error2, "disconnecting controller");
      }
      this.outletObserver.stop();
      this.targetObserver.stop();
      this.valueObserver.stop();
      this.bindingObserver.stop();
    }
    get application() {
      return this.module.application;
    }
    get identifier() {
      return this.module.identifier;
    }
    get schema() {
      return this.application.schema;
    }
    get dispatcher() {
      return this.application.dispatcher;
    }
    get element() {
      return this.scope.element;
    }
    get parentElement() {
      return this.element.parentElement;
    }
    handleError(error2, message, detail = {}) {
      const { identifier, controller, element } = this;
      detail = Object.assign({ identifier, controller, element }, detail);
      this.application.handleError(error2, `Error ${message}`, detail);
    }
    targetConnected(element, name) {
      this.invokeControllerMethod(`${name}TargetConnected`, element);
    }
    targetDisconnected(element, name) {
      this.invokeControllerMethod(`${name}TargetDisconnected`, element);
    }
    outletConnected(outlet, element, name) {
      this.invokeControllerMethod(`${namespaceCamelize(name)}OutletConnected`, outlet, element);
    }
    outletDisconnected(outlet, element, name) {
      this.invokeControllerMethod(`${namespaceCamelize(name)}OutletDisconnected`, outlet, element);
    }
    invokeControllerMethod(methodName, ...args) {
      const controller = this.controller;
      if (typeof controller[methodName] == "function") {
        controller[methodName](...args);
      }
    }
  };
  function bless(constructor) {
    return shadow(constructor, getBlessedProperties(constructor));
  }
  function shadow(constructor, properties) {
    const shadowConstructor = extend2(constructor);
    const shadowProperties = getShadowProperties(constructor.prototype, properties);
    Object.defineProperties(shadowConstructor.prototype, shadowProperties);
    return shadowConstructor;
  }
  function getBlessedProperties(constructor) {
    const blessings = readInheritableStaticArrayValues(constructor, "blessings");
    return blessings.reduce((blessedProperties, blessing) => {
      const properties = blessing(constructor);
      for (const key in properties) {
        const descriptor = blessedProperties[key] || {};
        blessedProperties[key] = Object.assign(descriptor, properties[key]);
      }
      return blessedProperties;
    }, {});
  }
  function getShadowProperties(prototype, properties) {
    return getOwnKeys(properties).reduce((shadowProperties, key) => {
      const descriptor = getShadowedDescriptor(prototype, properties, key);
      if (descriptor) {
        Object.assign(shadowProperties, { [key]: descriptor });
      }
      return shadowProperties;
    }, {});
  }
  function getShadowedDescriptor(prototype, properties, key) {
    const shadowingDescriptor = Object.getOwnPropertyDescriptor(prototype, key);
    const shadowedByValue = shadowingDescriptor && "value" in shadowingDescriptor;
    if (!shadowedByValue) {
      const descriptor = Object.getOwnPropertyDescriptor(properties, key).value;
      if (shadowingDescriptor) {
        descriptor.get = shadowingDescriptor.get || descriptor.get;
        descriptor.set = shadowingDescriptor.set || descriptor.set;
      }
      return descriptor;
    }
  }
  var getOwnKeys = (() => {
    if (typeof Object.getOwnPropertySymbols == "function") {
      return (object) => [...Object.getOwnPropertyNames(object), ...Object.getOwnPropertySymbols(object)];
    } else {
      return Object.getOwnPropertyNames;
    }
  })();
  var extend2 = (() => {
    function extendWithReflect(constructor) {
      function extended() {
        return Reflect.construct(constructor, arguments, new.target);
      }
      extended.prototype = Object.create(constructor.prototype, {
        constructor: { value: extended }
      });
      Reflect.setPrototypeOf(extended, constructor);
      return extended;
    }
    function testReflectExtension() {
      const a = function() {
        this.a.call(this);
      };
      const b = extendWithReflect(a);
      b.prototype.a = function() {
      };
      return new b();
    }
    try {
      testReflectExtension();
      return extendWithReflect;
    } catch (error2) {
      return (constructor) => class extended extends constructor {
      };
    }
  })();
  function blessDefinition(definition) {
    return {
      identifier: definition.identifier,
      controllerConstructor: bless(definition.controllerConstructor)
    };
  }
  var Module = class {
    constructor(application2, definition) {
      this.application = application2;
      this.definition = blessDefinition(definition);
      this.contextsByScope = /* @__PURE__ */ new WeakMap();
      this.connectedContexts = /* @__PURE__ */ new Set();
    }
    get identifier() {
      return this.definition.identifier;
    }
    get controllerConstructor() {
      return this.definition.controllerConstructor;
    }
    get contexts() {
      return Array.from(this.connectedContexts);
    }
    connectContextForScope(scope) {
      const context = this.fetchContextForScope(scope);
      this.connectedContexts.add(context);
      context.connect();
    }
    disconnectContextForScope(scope) {
      const context = this.contextsByScope.get(scope);
      if (context) {
        this.connectedContexts.delete(context);
        context.disconnect();
      }
    }
    fetchContextForScope(scope) {
      let context = this.contextsByScope.get(scope);
      if (!context) {
        context = new Context(this, scope);
        this.contextsByScope.set(scope, context);
      }
      return context;
    }
  };
  var ClassMap = class {
    constructor(scope) {
      this.scope = scope;
    }
    has(name) {
      return this.data.has(this.getDataKey(name));
    }
    get(name) {
      return this.getAll(name)[0];
    }
    getAll(name) {
      const tokenString = this.data.get(this.getDataKey(name)) || "";
      return tokenize(tokenString);
    }
    getAttributeName(name) {
      return this.data.getAttributeNameForKey(this.getDataKey(name));
    }
    getDataKey(name) {
      return `${name}-class`;
    }
    get data() {
      return this.scope.data;
    }
  };
  var DataMap = class {
    constructor(scope) {
      this.scope = scope;
    }
    get element() {
      return this.scope.element;
    }
    get identifier() {
      return this.scope.identifier;
    }
    get(key) {
      const name = this.getAttributeNameForKey(key);
      return this.element.getAttribute(name);
    }
    set(key, value) {
      const name = this.getAttributeNameForKey(key);
      this.element.setAttribute(name, value);
      return this.get(key);
    }
    has(key) {
      const name = this.getAttributeNameForKey(key);
      return this.element.hasAttribute(name);
    }
    delete(key) {
      if (this.has(key)) {
        const name = this.getAttributeNameForKey(key);
        this.element.removeAttribute(name);
        return true;
      } else {
        return false;
      }
    }
    getAttributeNameForKey(key) {
      return `data-${this.identifier}-${dasherize(key)}`;
    }
  };
  var Guide = class {
    constructor(logger) {
      this.warnedKeysByObject = /* @__PURE__ */ new WeakMap();
      this.logger = logger;
    }
    warn(object, key, message) {
      let warnedKeys = this.warnedKeysByObject.get(object);
      if (!warnedKeys) {
        warnedKeys = /* @__PURE__ */ new Set();
        this.warnedKeysByObject.set(object, warnedKeys);
      }
      if (!warnedKeys.has(key)) {
        warnedKeys.add(key);
        this.logger.warn(message, object);
      }
    }
  };
  function attributeValueContainsToken(attributeName, token) {
    return `[${attributeName}~="${token}"]`;
  }
  var TargetSet = class {
    constructor(scope) {
      this.scope = scope;
    }
    get element() {
      return this.scope.element;
    }
    get identifier() {
      return this.scope.identifier;
    }
    get schema() {
      return this.scope.schema;
    }
    has(targetName) {
      return this.find(targetName) != null;
    }
    find(...targetNames) {
      return targetNames.reduce((target, targetName) => target || this.findTarget(targetName) || this.findLegacyTarget(targetName), void 0);
    }
    findAll(...targetNames) {
      return targetNames.reduce((targets, targetName) => [
        ...targets,
        ...this.findAllTargets(targetName),
        ...this.findAllLegacyTargets(targetName)
      ], []);
    }
    findTarget(targetName) {
      const selector = this.getSelectorForTargetName(targetName);
      return this.scope.findElement(selector);
    }
    findAllTargets(targetName) {
      const selector = this.getSelectorForTargetName(targetName);
      return this.scope.findAllElements(selector);
    }
    getSelectorForTargetName(targetName) {
      const attributeName = this.schema.targetAttributeForScope(this.identifier);
      return attributeValueContainsToken(attributeName, targetName);
    }
    findLegacyTarget(targetName) {
      const selector = this.getLegacySelectorForTargetName(targetName);
      return this.deprecate(this.scope.findElement(selector), targetName);
    }
    findAllLegacyTargets(targetName) {
      const selector = this.getLegacySelectorForTargetName(targetName);
      return this.scope.findAllElements(selector).map((element) => this.deprecate(element, targetName));
    }
    getLegacySelectorForTargetName(targetName) {
      const targetDescriptor = `${this.identifier}.${targetName}`;
      return attributeValueContainsToken(this.schema.targetAttribute, targetDescriptor);
    }
    deprecate(element, targetName) {
      if (element) {
        const { identifier } = this;
        const attributeName = this.schema.targetAttribute;
        const revisedAttributeName = this.schema.targetAttributeForScope(identifier);
        this.guide.warn(element, `target:${targetName}`, `Please replace ${attributeName}="${identifier}.${targetName}" with ${revisedAttributeName}="${targetName}". The ${attributeName} attribute is deprecated and will be removed in a future version of Stimulus.`);
      }
      return element;
    }
    get guide() {
      return this.scope.guide;
    }
  };
  var OutletSet = class {
    constructor(scope, controllerElement) {
      this.scope = scope;
      this.controllerElement = controllerElement;
    }
    get element() {
      return this.scope.element;
    }
    get identifier() {
      return this.scope.identifier;
    }
    get schema() {
      return this.scope.schema;
    }
    has(outletName) {
      return this.find(outletName) != null;
    }
    find(...outletNames) {
      return outletNames.reduce((outlet, outletName) => outlet || this.findOutlet(outletName), void 0);
    }
    findAll(...outletNames) {
      return outletNames.reduce((outlets, outletName) => [...outlets, ...this.findAllOutlets(outletName)], []);
    }
    getSelectorForOutletName(outletName) {
      const attributeName = this.schema.outletAttributeForScope(this.identifier, outletName);
      return this.controllerElement.getAttribute(attributeName);
    }
    findOutlet(outletName) {
      const selector = this.getSelectorForOutletName(outletName);
      if (selector)
        return this.findElement(selector, outletName);
    }
    findAllOutlets(outletName) {
      const selector = this.getSelectorForOutletName(outletName);
      return selector ? this.findAllElements(selector, outletName) : [];
    }
    findElement(selector, outletName) {
      const elements = this.scope.queryElements(selector);
      return elements.filter((element) => this.matchesElement(element, selector, outletName))[0];
    }
    findAllElements(selector, outletName) {
      const elements = this.scope.queryElements(selector);
      return elements.filter((element) => this.matchesElement(element, selector, outletName));
    }
    matchesElement(element, selector, outletName) {
      const controllerAttribute = element.getAttribute(this.scope.schema.controllerAttribute) || "";
      return element.matches(selector) && controllerAttribute.split(" ").includes(outletName);
    }
  };
  var Scope = class {
    constructor(schema, element, identifier, logger) {
      this.targets = new TargetSet(this);
      this.classes = new ClassMap(this);
      this.data = new DataMap(this);
      this.containsElement = (element2) => {
        return element2.closest(this.controllerSelector) === this.element;
      };
      this.schema = schema;
      this.element = element;
      this.identifier = identifier;
      this.guide = new Guide(logger);
      this.outlets = new OutletSet(this.documentScope, element);
    }
    findElement(selector) {
      return this.element.matches(selector) ? this.element : this.queryElements(selector).find(this.containsElement);
    }
    findAllElements(selector) {
      return [
        ...this.element.matches(selector) ? [this.element] : [],
        ...this.queryElements(selector).filter(this.containsElement)
      ];
    }
    queryElements(selector) {
      return Array.from(this.element.querySelectorAll(selector));
    }
    get controllerSelector() {
      return attributeValueContainsToken(this.schema.controllerAttribute, this.identifier);
    }
    get isDocumentScope() {
      return this.element === document.documentElement;
    }
    get documentScope() {
      return this.isDocumentScope ? this : new Scope(this.schema, document.documentElement, this.identifier, this.guide.logger);
    }
  };
  var ScopeObserver = class {
    constructor(element, schema, delegate) {
      this.element = element;
      this.schema = schema;
      this.delegate = delegate;
      this.valueListObserver = new ValueListObserver(this.element, this.controllerAttribute, this);
      this.scopesByIdentifierByElement = /* @__PURE__ */ new WeakMap();
      this.scopeReferenceCounts = /* @__PURE__ */ new WeakMap();
    }
    start() {
      this.valueListObserver.start();
    }
    stop() {
      this.valueListObserver.stop();
    }
    get controllerAttribute() {
      return this.schema.controllerAttribute;
    }
    parseValueForToken(token) {
      const { element, content: identifier } = token;
      const scopesByIdentifier = this.fetchScopesByIdentifierForElement(element);
      let scope = scopesByIdentifier.get(identifier);
      if (!scope) {
        scope = this.delegate.createScopeForElementAndIdentifier(element, identifier);
        scopesByIdentifier.set(identifier, scope);
      }
      return scope;
    }
    elementMatchedValue(element, value) {
      const referenceCount = (this.scopeReferenceCounts.get(value) || 0) + 1;
      this.scopeReferenceCounts.set(value, referenceCount);
      if (referenceCount == 1) {
        this.delegate.scopeConnected(value);
      }
    }
    elementUnmatchedValue(element, value) {
      const referenceCount = this.scopeReferenceCounts.get(value);
      if (referenceCount) {
        this.scopeReferenceCounts.set(value, referenceCount - 1);
        if (referenceCount == 1) {
          this.delegate.scopeDisconnected(value);
        }
      }
    }
    fetchScopesByIdentifierForElement(element) {
      let scopesByIdentifier = this.scopesByIdentifierByElement.get(element);
      if (!scopesByIdentifier) {
        scopesByIdentifier = /* @__PURE__ */ new Map();
        this.scopesByIdentifierByElement.set(element, scopesByIdentifier);
      }
      return scopesByIdentifier;
    }
  };
  var Router = class {
    constructor(application2) {
      this.application = application2;
      this.scopeObserver = new ScopeObserver(this.element, this.schema, this);
      this.scopesByIdentifier = new Multimap();
      this.modulesByIdentifier = /* @__PURE__ */ new Map();
    }
    get element() {
      return this.application.element;
    }
    get schema() {
      return this.application.schema;
    }
    get logger() {
      return this.application.logger;
    }
    get controllerAttribute() {
      return this.schema.controllerAttribute;
    }
    get modules() {
      return Array.from(this.modulesByIdentifier.values());
    }
    get contexts() {
      return this.modules.reduce((contexts, module) => contexts.concat(module.contexts), []);
    }
    start() {
      this.scopeObserver.start();
    }
    stop() {
      this.scopeObserver.stop();
    }
    loadDefinition(definition) {
      this.unloadIdentifier(definition.identifier);
      const module = new Module(this.application, definition);
      this.connectModule(module);
      const afterLoad = definition.controllerConstructor.afterLoad;
      if (afterLoad) {
        afterLoad(definition.identifier, this.application);
      }
    }
    unloadIdentifier(identifier) {
      const module = this.modulesByIdentifier.get(identifier);
      if (module) {
        this.disconnectModule(module);
      }
    }
    getContextForElementAndIdentifier(element, identifier) {
      const module = this.modulesByIdentifier.get(identifier);
      if (module) {
        return module.contexts.find((context) => context.element == element);
      }
    }
    handleError(error2, message, detail) {
      this.application.handleError(error2, message, detail);
    }
    createScopeForElementAndIdentifier(element, identifier) {
      return new Scope(this.schema, element, identifier, this.logger);
    }
    scopeConnected(scope) {
      this.scopesByIdentifier.add(scope.identifier, scope);
      const module = this.modulesByIdentifier.get(scope.identifier);
      if (module) {
        module.connectContextForScope(scope);
      }
    }
    scopeDisconnected(scope) {
      this.scopesByIdentifier.delete(scope.identifier, scope);
      const module = this.modulesByIdentifier.get(scope.identifier);
      if (module) {
        module.disconnectContextForScope(scope);
      }
    }
    connectModule(module) {
      this.modulesByIdentifier.set(module.identifier, module);
      const scopes = this.scopesByIdentifier.getValuesForKey(module.identifier);
      scopes.forEach((scope) => module.connectContextForScope(scope));
    }
    disconnectModule(module) {
      this.modulesByIdentifier.delete(module.identifier);
      const scopes = this.scopesByIdentifier.getValuesForKey(module.identifier);
      scopes.forEach((scope) => module.disconnectContextForScope(scope));
    }
  };
  var defaultSchema = {
    controllerAttribute: "data-controller",
    actionAttribute: "data-action",
    targetAttribute: "data-target",
    targetAttributeForScope: (identifier) => `data-${identifier}-target`,
    outletAttributeForScope: (identifier, outlet) => `data-${identifier}-${outlet}-outlet`,
    keyMappings: Object.assign(Object.assign({ enter: "Enter", tab: "Tab", esc: "Escape", space: " ", up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", home: "Home", end: "End" }, objectFromEntries("abcdefghijklmnopqrstuvwxyz".split("").map((c) => [c, c]))), objectFromEntries("0123456789".split("").map((n) => [n, n])))
  };
  function objectFromEntries(array) {
    return array.reduce((memo, [k, v]) => Object.assign(Object.assign({}, memo), { [k]: v }), {});
  }
  var Application = class {
    constructor(element = document.documentElement, schema = defaultSchema) {
      this.logger = console;
      this.debug = false;
      this.logDebugActivity = (identifier, functionName, detail = {}) => {
        if (this.debug) {
          this.logFormattedMessage(identifier, functionName, detail);
        }
      };
      this.element = element;
      this.schema = schema;
      this.dispatcher = new Dispatcher(this);
      this.router = new Router(this);
      this.actionDescriptorFilters = Object.assign({}, defaultActionDescriptorFilters);
    }
    static start(element, schema) {
      const application2 = new this(element, schema);
      application2.start();
      return application2;
    }
    async start() {
      await domReady();
      this.logDebugActivity("application", "starting");
      this.dispatcher.start();
      this.router.start();
      this.logDebugActivity("application", "start");
    }
    stop() {
      this.logDebugActivity("application", "stopping");
      this.dispatcher.stop();
      this.router.stop();
      this.logDebugActivity("application", "stop");
    }
    register(identifier, controllerConstructor) {
      this.load({ identifier, controllerConstructor });
    }
    registerActionOption(name, filter2) {
      this.actionDescriptorFilters[name] = filter2;
    }
    load(head, ...rest) {
      const definitions = Array.isArray(head) ? head : [head, ...rest];
      definitions.forEach((definition) => {
        if (definition.controllerConstructor.shouldLoad) {
          this.router.loadDefinition(definition);
        }
      });
    }
    unload(head, ...rest) {
      const identifiers = Array.isArray(head) ? head : [head, ...rest];
      identifiers.forEach((identifier) => this.router.unloadIdentifier(identifier));
    }
    get controllers() {
      return this.router.contexts.map((context) => context.controller);
    }
    getControllerForElementAndIdentifier(element, identifier) {
      const context = this.router.getContextForElementAndIdentifier(element, identifier);
      return context ? context.controller : null;
    }
    handleError(error2, message, detail) {
      var _a;
      this.logger.error(`%s

%o

%o`, message, error2, detail);
      (_a = window.onerror) === null || _a === void 0 ? void 0 : _a.call(window, message, "", 0, 0, error2);
    }
    logFormattedMessage(identifier, functionName, detail = {}) {
      detail = Object.assign({ application: this }, detail);
      this.logger.groupCollapsed(`${identifier} #${functionName}`);
      this.logger.log("details:", Object.assign({}, detail));
      this.logger.groupEnd();
    }
  };
  function domReady() {
    return new Promise((resolve) => {
      if (document.readyState == "loading") {
        document.addEventListener("DOMContentLoaded", () => resolve());
      } else {
        resolve();
      }
    });
  }
  function ClassPropertiesBlessing(constructor) {
    const classes = readInheritableStaticArrayValues(constructor, "classes");
    return classes.reduce((properties, classDefinition) => {
      return Object.assign(properties, propertiesForClassDefinition(classDefinition));
    }, {});
  }
  function propertiesForClassDefinition(key) {
    return {
      [`${key}Class`]: {
        get() {
          const { classes } = this;
          if (classes.has(key)) {
            return classes.get(key);
          } else {
            const attribute = classes.getAttributeName(key);
            throw new Error(`Missing attribute "${attribute}"`);
          }
        }
      },
      [`${key}Classes`]: {
        get() {
          return this.classes.getAll(key);
        }
      },
      [`has${capitalize(key)}Class`]: {
        get() {
          return this.classes.has(key);
        }
      }
    };
  }
  function OutletPropertiesBlessing(constructor) {
    const outlets = readInheritableStaticArrayValues(constructor, "outlets");
    return outlets.reduce((properties, outletDefinition) => {
      return Object.assign(properties, propertiesForOutletDefinition(outletDefinition));
    }, {});
  }
  function propertiesForOutletDefinition(name) {
    const camelizedName = namespaceCamelize(name);
    return {
      [`${camelizedName}Outlet`]: {
        get() {
          const outlet = this.outlets.find(name);
          if (outlet) {
            const outletController = this.application.getControllerForElementAndIdentifier(outlet, name);
            if (outletController) {
              return outletController;
            } else {
              throw new Error(`Missing "data-controller=${name}" attribute on outlet element for "${this.identifier}" controller`);
            }
          }
          throw new Error(`Missing outlet element "${name}" for "${this.identifier}" controller`);
        }
      },
      [`${camelizedName}Outlets`]: {
        get() {
          const outlets = this.outlets.findAll(name);
          if (outlets.length > 0) {
            return outlets.map((outlet) => {
              const controller = this.application.getControllerForElementAndIdentifier(outlet, name);
              if (controller) {
                return controller;
              } else {
                console.warn(`The provided outlet element is missing the outlet controller "${name}" for "${this.identifier}"`, outlet);
              }
            }).filter((controller) => controller);
          }
          return [];
        }
      },
      [`${camelizedName}OutletElement`]: {
        get() {
          const outlet = this.outlets.find(name);
          if (outlet) {
            return outlet;
          } else {
            throw new Error(`Missing outlet element "${name}" for "${this.identifier}" controller`);
          }
        }
      },
      [`${camelizedName}OutletElements`]: {
        get() {
          return this.outlets.findAll(name);
        }
      },
      [`has${capitalize(camelizedName)}Outlet`]: {
        get() {
          return this.outlets.has(name);
        }
      }
    };
  }
  function TargetPropertiesBlessing(constructor) {
    const targets = readInheritableStaticArrayValues(constructor, "targets");
    return targets.reduce((properties, targetDefinition) => {
      return Object.assign(properties, propertiesForTargetDefinition(targetDefinition));
    }, {});
  }
  function propertiesForTargetDefinition(name) {
    return {
      [`${name}Target`]: {
        get() {
          const target = this.targets.find(name);
          if (target) {
            return target;
          } else {
            throw new Error(`Missing target element "${name}" for "${this.identifier}" controller`);
          }
        }
      },
      [`${name}Targets`]: {
        get() {
          return this.targets.findAll(name);
        }
      },
      [`has${capitalize(name)}Target`]: {
        get() {
          return this.targets.has(name);
        }
      }
    };
  }
  function ValuePropertiesBlessing(constructor) {
    const valueDefinitionPairs = readInheritableStaticObjectPairs(constructor, "values");
    const propertyDescriptorMap = {
      valueDescriptorMap: {
        get() {
          return valueDefinitionPairs.reduce((result, valueDefinitionPair) => {
            const valueDescriptor = parseValueDefinitionPair(valueDefinitionPair, this.identifier);
            const attributeName = this.data.getAttributeNameForKey(valueDescriptor.key);
            return Object.assign(result, { [attributeName]: valueDescriptor });
          }, {});
        }
      }
    };
    return valueDefinitionPairs.reduce((properties, valueDefinitionPair) => {
      return Object.assign(properties, propertiesForValueDefinitionPair(valueDefinitionPair));
    }, propertyDescriptorMap);
  }
  function propertiesForValueDefinitionPair(valueDefinitionPair, controller) {
    const definition = parseValueDefinitionPair(valueDefinitionPair, controller);
    const { key, name, reader: read, writer: write } = definition;
    return {
      [name]: {
        get() {
          const value = this.data.get(key);
          if (value !== null) {
            return read(value);
          } else {
            return definition.defaultValue;
          }
        },
        set(value) {
          if (value === void 0) {
            this.data.delete(key);
          } else {
            this.data.set(key, write(value));
          }
        }
      },
      [`has${capitalize(name)}`]: {
        get() {
          return this.data.has(key) || definition.hasCustomDefaultValue;
        }
      }
    };
  }
  function parseValueDefinitionPair([token, typeDefinition], controller) {
    return valueDescriptorForTokenAndTypeDefinition({
      controller,
      token,
      typeDefinition
    });
  }
  function parseValueTypeConstant(constant) {
    switch (constant) {
      case Array:
        return "array";
      case Boolean:
        return "boolean";
      case Number:
        return "number";
      case Object:
        return "object";
      case String:
        return "string";
    }
  }
  function parseValueTypeDefault(defaultValue) {
    switch (typeof defaultValue) {
      case "boolean":
        return "boolean";
      case "number":
        return "number";
      case "string":
        return "string";
    }
    if (Array.isArray(defaultValue))
      return "array";
    if (Object.prototype.toString.call(defaultValue) === "[object Object]")
      return "object";
  }
  function parseValueTypeObject(payload) {
    const typeFromObject = parseValueTypeConstant(payload.typeObject.type);
    if (!typeFromObject)
      return;
    const defaultValueType = parseValueTypeDefault(payload.typeObject.default);
    if (typeFromObject !== defaultValueType) {
      const propertyPath = payload.controller ? `${payload.controller}.${payload.token}` : payload.token;
      throw new Error(`The specified default value for the Stimulus Value "${propertyPath}" must match the defined type "${typeFromObject}". The provided default value of "${payload.typeObject.default}" is of type "${defaultValueType}".`);
    }
    return typeFromObject;
  }
  function parseValueTypeDefinition(payload) {
    const typeFromObject = parseValueTypeObject({
      controller: payload.controller,
      token: payload.token,
      typeObject: payload.typeDefinition
    });
    const typeFromDefaultValue = parseValueTypeDefault(payload.typeDefinition);
    const typeFromConstant = parseValueTypeConstant(payload.typeDefinition);
    const type = typeFromObject || typeFromDefaultValue || typeFromConstant;
    if (type)
      return type;
    const propertyPath = payload.controller ? `${payload.controller}.${payload.typeDefinition}` : payload.token;
    throw new Error(`Unknown value type "${propertyPath}" for "${payload.token}" value`);
  }
  function defaultValueForDefinition(typeDefinition) {
    const constant = parseValueTypeConstant(typeDefinition);
    if (constant)
      return defaultValuesByType[constant];
    const defaultValue = typeDefinition.default;
    if (defaultValue !== void 0)
      return defaultValue;
    return typeDefinition;
  }
  function valueDescriptorForTokenAndTypeDefinition(payload) {
    const key = `${dasherize(payload.token)}-value`;
    const type = parseValueTypeDefinition(payload);
    return {
      type,
      key,
      name: camelize(key),
      get defaultValue() {
        return defaultValueForDefinition(payload.typeDefinition);
      },
      get hasCustomDefaultValue() {
        return parseValueTypeDefault(payload.typeDefinition) !== void 0;
      },
      reader: readers[type],
      writer: writers[type] || writers.default
    };
  }
  var defaultValuesByType = {
    get array() {
      return [];
    },
    boolean: false,
    number: 0,
    get object() {
      return {};
    },
    string: ""
  };
  var readers = {
    array(value) {
      const array = JSON.parse(value);
      if (!Array.isArray(array)) {
        throw new TypeError(`expected value of type "array" but instead got value "${value}" of type "${parseValueTypeDefault(array)}"`);
      }
      return array;
    },
    boolean(value) {
      return !(value == "0" || String(value).toLowerCase() == "false");
    },
    number(value) {
      return Number(value);
    },
    object(value) {
      const object = JSON.parse(value);
      if (object === null || typeof object != "object" || Array.isArray(object)) {
        throw new TypeError(`expected value of type "object" but instead got value "${value}" of type "${parseValueTypeDefault(object)}"`);
      }
      return object;
    },
    string(value) {
      return value;
    }
  };
  var writers = {
    default: writeString,
    array: writeJSON,
    object: writeJSON
  };
  function writeJSON(value) {
    return JSON.stringify(value);
  }
  function writeString(value) {
    return `${value}`;
  }
  var Controller = class {
    constructor(context) {
      this.context = context;
    }
    static get shouldLoad() {
      return true;
    }
    static afterLoad(_identifier, _application) {
      return;
    }
    get application() {
      return this.context.application;
    }
    get scope() {
      return this.context.scope;
    }
    get element() {
      return this.scope.element;
    }
    get identifier() {
      return this.scope.identifier;
    }
    get targets() {
      return this.scope.targets;
    }
    get outlets() {
      return this.scope.outlets;
    }
    get classes() {
      return this.scope.classes;
    }
    get data() {
      return this.scope.data;
    }
    initialize() {
    }
    connect() {
    }
    disconnect() {
    }
    dispatch(eventName, { target = this.element, detail = {}, prefix = this.identifier, bubbles = true, cancelable = true } = {}) {
      const type = prefix ? `${prefix}:${eventName}` : eventName;
      const event = new CustomEvent(type, { detail, bubbles, cancelable });
      target.dispatchEvent(event);
      return event;
    }
  };
  Controller.blessings = [
    ClassPropertiesBlessing,
    TargetPropertiesBlessing,
    ValuePropertiesBlessing,
    OutletPropertiesBlessing
  ];
  Controller.targets = [];
  Controller.outlets = [];
  Controller.values = {};

  // app/javascript/controllers/application.js
  var application = Application.start();
  application.debug = false;
  window.Stimulus = application;

  // app/javascript/controllers/hello-controller.js
  var hello_controller_default = class extends Controller {
    connect() {
    }
    sideMenu = document.getElementById("side-menu");
    mainSection = document.getElementById("main");
    openMenu() {
      this.sideMenu.classList.remove("left-[-250px]");
      this.sideMenu.classList.add("left-0");
      this.mainSection.classList.add("xl:ml-64");
    }
    closeMenu() {
      this.sideMenu.classList.remove("left-0");
      this.sideMenu.classList.add("left-[-250px]");
      this.mainSection.classList.remove("xl:ml-64");
    }
  };

  // app/javascript/controllers/search_form-controller.js
  var import_ujs = __toESM(require_rails_ujs());

  // node_modules/stimulus-use/dist/index.js
  var DebounceController = class extends Controller {
  };
  DebounceController.debounces = [];
  var defaultWait$1 = 200;
  var debounce = (fn, wait = defaultWait$1) => {
    let timeoutId = null;
    return function() {
      const args = Array.from(arguments);
      const context = this;
      const params = args.map((arg) => arg.params);
      const callback = () => {
        args.forEach((arg, index) => arg.params = params[index]);
        return fn.apply(context, args);
      };
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(callback, wait);
    };
  };
  var useDebounce = (composableController, options) => {
    const controller = composableController;
    const constructor = controller.constructor;
    constructor.debounces.forEach((func) => {
      if (typeof func === "string") {
        controller[func] = debounce(controller[func], options === null || options === void 0 ? void 0 : options.wait);
      }
      if (typeof func === "object") {
        const { name, wait } = func;
        if (!name)
          return;
        controller[name] = debounce(controller[name], wait || (options === null || options === void 0 ? void 0 : options.wait));
      }
    });
  };
  var ThrottleController = class extends Controller {
  };
  ThrottleController.throttles = [];

  // app/javascript/controllers/search_form-controller.js
  var search_form_controller_default = class extends Controller {
    connect() {
      useDebounce(this, { wait: 500 });
    }
    getElementById(element) {
      return document.getElementById(element);
    }
    showBox() {
      this.getElementById("projects-list").classList.remove("hidden");
      this.getElementById("cross-btn").classList.remove("hidden");
    }
    hideBox() {
      this.getElementById("projects-list").classList.add("hidden");
      this.getElementById("cross-btn").classList.add("hidden");
    }
    search(event) {
      import_ujs.default.fire(this.element, "submit");
      event.preventDefault();
    }
    filterProject(event) {
      const projects = document.getElementsByClassName("projects");
      const element = event.target;
      [].forEach.call(projects, (item) => {
        if (!item.textContent.toLowerCase().includes(element.value.toLowerCase()))
          item.closest(".wrapper").classList.add("hidden");
        else
          item.closest(".wrapper").classList.remove("hidden");
      });
    }
  };
  __publicField(search_form_controller_default, "debounces", ["search", "filterProject"]);

  // app/javascript/controllers/admin-controller.js
  var admin_controller_default = class extends Controller {
    connect() {
      this.token = document.querySelector(
        'meta[name="csrf-token"]'
      ).content;
      this.resetFields();
    }
    resetFields() {
      this.categoryTargets.forEach((item) => {
        if (!this.isOriginChecklist)
          item.checked = false;
      });
    }
    get isOriginChecklist() {
      return this.target === "changes";
    }
    get isOriginReviews() {
      return this.target === "reviews";
    }
    get isOriginCategories() {
      return this.target === "categories";
    }
    get target() {
      return this.categoryTarget.getAttribute("data-origin");
    }
    get url() {
      return this.categoryTarget.getAttribute("data-url");
    }
    async checklist() {
      if (this.categoryTarget.checked) {
        const currentItem = this.getElementById("rc-" + this.categoryTarget.value);
        if (currentItem)
          currentItem.remove();
      } else {
        await this.fetchBody();
      }
    }
    copyText(event) {
      const target = event.target;
      const parent = target.closest("div");
      const copyText = parent.firstElementChild;
      navigator.clipboard.writeText(copyText.innerHTML);
      parent.lastElementChild.classList.remove("hidden");
      setTimeout(() => {
        parent.lastElementChild.classList.add("hidden");
      }, 1e3);
    }
    async fetchBody() {
      await get(this.url, {
        "X-CSRF-Token": this.token,
        contentType: "application/json",
        credentials: "same-origin",
        responseKind: "turbo-stream"
      }).then((response) => response.text).then((html) => {
        return Turbo.renderStreamMessage(html);
      });
    }
    getElementById(element) {
      return document.getElementById(element);
    }
    async switch(event) {
      let url = event.target.getAttribute("data-url") || this.url;
      const cat = event.target.getAttribute("data-value") || event.target.value;
      if (this.isOriginReviews) {
        this.getElementById("filter-project").value = this.getElementById("project-" + cat).textContent;
        this.getElementById("project-title").innerHTML = this.getElementById("project-" + cat).textContent;
        this.getElementById("projects-list").classList.add("hidden");
        this.getElementById("cross-btn").classList.add("hidden");
      }
      if (this.isOriginCategories) {
        this.getElementById("add-article").classList.remove("hidden");
      }
      const params = { category: cat, origin: this.target };
      await post(url, {
        body: params,
        "X-CSRF-Token": this.token,
        contentType: "application/json",
        credentials: "same-origin",
        responseKind: "turbo-stream"
      }).then((response) => response.text).then((html) => {
        return Turbo.renderStreamMessage(html);
      });
      event.preventDefault();
    }
  };
  __publicField(admin_controller_default, "targets", ["category"]);

  // app/javascript/controllers/index.js
  application.register("hello", hello_controller_default);
  application.register("search-form", search_form_controller_default);
  application.register("admin", admin_controller_default);
})();
/*! Bundled license information:

stimulus-use/dist/index.js:
  (*! *****************************************************************************
  Copyright (c) Microsoft Corporation.
  
  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.
  
  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** *)
*/
//# sourceMappingURL=assets/application.js.map
