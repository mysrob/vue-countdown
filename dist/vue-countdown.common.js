/*!
 * vue-countdown v0.6.0
 * https://github.com/xkeshi/vue-countdown
 *
 * Copyright (c) 2018 Xkeshi
 * Released under the MIT license
 *
 * Date: 2018-03-08T19:00:30.371Z
 */

'use strict';

var MILLISECONDS_SECOND = 1000;
var MILLISECONDS_MINUTE = 60 * MILLISECONDS_SECOND;
var MILLISECONDS_HOUR = 60 * MILLISECONDS_MINUTE;
var MILLISECONDS_DAY = 24 * MILLISECONDS_HOUR;

var index = {
  data: function data() {
    return {
      /**
       * Total number of time (in milliseconds) for the countdown.
       * @type {number}
       */
      count: 0,

      /**
       * Define if the time is countdowning.
       * @type {boolean}
       */
      counting: false,

      /**
       * The absolute end time.
       * @type {number}
       */
      endTime: 0
    };
  },


  props: {
    /**
     * Start to countdown automatically when initialized.
     */
    autoStart: {
      type: Boolean,
      default: true
    },

    /**
     * Indicate if emit the countdown events or not.
     */
    emitEvents: {
      type: Boolean,
      default: true
    },

    /**
     * Update interval time (in milliseconds) of the countdown.
     */
    interval: {
      type: Number,
      default: 1000
    },

    /**
     * Add a leading zero to the output numbers if they are less than 10.
     */
    leadingZero: {
      type: Boolean,
      default: true
    },

    /**
     * Generate the current time of a specific time zone.
     */
    now: {
      type: Function,
      default: function _default() {
        return Date.now();
      }
    },

    /**
     * Total number of time (in milliseconds) for the countdown.
     */
    time: {
      type: Number,
      default: 0,
      required: true,
      validator: function validator(value) {
        return value >= 0;
      }
    },

    /**
     * The tag of the component root element in the countdown.
     */
    tag: {
      type: String,
      default: 'span'
    }
  },

  computed: {
    /**
     * Remaining days.
     * @returns {number}
     */
    days: function days() {
      return Math.floor(this.count / MILLISECONDS_DAY);
    },


    /**
     * Remaining hours.
     * @returns {number}
     */
    hours: function hours() {
      return Math.floor(this.count % MILLISECONDS_DAY / MILLISECONDS_HOUR);
    },


    /**
     * Remaining minutes.
     * @returns {number}
     */
    minutes: function minutes() {
      return Math.floor(this.count % MILLISECONDS_HOUR / MILLISECONDS_MINUTE);
    },


    /**
     * Remaining seconds.
     * @returns {number}
     */
    seconds: function seconds() {
      var interval = this.interval;

      var seconds = this.count % MILLISECONDS_MINUTE / MILLISECONDS_SECOND;

      if (interval < 10) {
        return seconds.toFixed(3);
      } else if (interval >= 10 && interval < 100) {
        return seconds.toFixed(2);
      } else if (interval >= 100 && interval < 1000) {
        return seconds.toFixed(1);
      }

      return Math.floor(seconds);
    },


    /**
     * Total remaining days.
     * @returns {number}
     */
    totalDays: function totalDays() {
      return this.days;
    },


    /**
     * Total remaining hours.
     * @returns {number}
     */
    totalHours: function totalHours() {
      return Math.floor(this.count / MILLISECONDS_HOUR);
    },


    /**
     * Total remaining minutes.
     * @returns {number}
     */
    totalMinutes: function totalMinutes() {
      return Math.floor(this.count / MILLISECONDS_MINUTE);
    },


    /**
     * Total remaining seconds.
     * @returns {number}
     */
    totalSeconds: function totalSeconds() {
      return Math.floor(this.count / MILLISECONDS_SECOND);
    }
  },

  render: function render(createElement) {
    var _this = this;

    var preprocess = function preprocess(value) {
      return _this.leadingZero && value < 10 ? '0' + value : value;
    };

    return createElement(this.tag, this.$scopedSlots.default ? [this.$scopedSlots.default({
      days: preprocess(this.days),
      hours: preprocess(this.hours),
      minutes: preprocess(this.minutes),
      seconds: preprocess(this.seconds),
      totalDays: this.totalDays,
      totalHours: this.totalHours,
      totalMinutes: this.totalMinutes,
      totalSeconds: this.totalSeconds
    })] : this.$slots.default);
  },
  created: function created() {
    this.init();
  },
  mounted: function mounted() {
    window.addEventListener('focus', this.onFocus = this.update.bind(this));
  },
  beforeDestroy: function beforeDestroy() {
    window.removeEventListener('focus', this.onFocus);
    clearTimeout(this.timeout);
  },


  watch: {
    time: function time() {
      this.init();
    }
  },

  methods: {
    /**
     * Initialize count.
     */
    init: function init() {
      var _this2 = this;

      var time = this.time;


      if (time > 0) {
        this.count = time;
        this.endTime = this.now() + time;

        if (this.autoStart) {
          this.$nextTick(function () {
            _this2.start();
          });
        }
      }
    },


    /**
     * Start to countdown.
     * @public
     * @emits Countdown#countdownstart
     */
    start: function start() {
      if (this.counting) {
        return;
      }

      if (this.emitEvents) {
        /**
         * Countdown start event.
         * @event Countdown#countdownstart
         */
        this.$emit('countdownstart');
      }

      this.counting = true;
      this.step();
    },


    /**
     * Pause countdown.
     * @public
     * @emits Countdown#countdownpause
     */
    pause: function pause() {
      if (!this.counting) {
        return;
      }

      if (this.emitEvents) {
        /**
         * Countdown pause event.
         * @event Countdown#countdownpause
         */
        this.$emit('countdownpause');
      }

      this.counting = false;
    },


    /**
     * Step to countdown.
     * @private
     * @emits Countdown#countdownprogress
     */
    step: function step() {
      var _this3 = this;

      if (!this.counting) {
        return;
      }

      if (this.emitEvents) {
        /**
         * Countdown progress event.
         * @event Countdown#countdownprogress
         */
        this.$emit('countdownprogress', {
          days: this.days,
          hours: this.hours,
          minutes: this.minutes,
          seconds: this.seconds
        });
      }

      if (this.count > 0) {
        var interval = this.interval;


        this.timeout = setTimeout(function () {
          _this3.count -= interval;
          _this3.step();
        }, interval);
      } else {
        this.count = 0;
        this.stop();
      }
    },


    /**
     * Stop the countdown.
     * @public
     * @emits Countdown#countdownend
     */
    stop: function stop() {
      this.counting = false;
      this.timeout = undefined;

      if (this.emitEvents) {
        /**
         * Countdown end event.
         * @event Countdown#countdownend
         */
        this.$emit('countdownend');
      }
    },


    /**
     * Update the count.
     * @private
     */
    update: function update() {
      if (this.counting) {
        this.count = Math.max(0, this.endTime - this.now());
      }
    }
  }
};

module.exports = index;
