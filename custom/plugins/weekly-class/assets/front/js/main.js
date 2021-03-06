if(typeof wcs_moment_locale !== 'undefined' ){
  moment.updateLocale('en', wcs_moment_locale);
}

var $lodash = typeof window._ !== 'undefined' ? window._ : typeof window.lodash !== 'undefined'  ? window.lodash : null

/** Vue Apps Collection */
var wcs_apps = [];
var timetables = document.querySelectorAll('div.wcs-vue');

Array.prototype.forEach.call(timetables, function(el, index){

    var id = el.getAttribute('id');
    var id_short = id.replace('wcs-app-', '');
    var element = window['EventsSchedule_' + id_short];
    var $default_options = typeof element.options !== 'undefined' ? element.options : {};
    var $default_filters = typeof element.filters !== 'undefined' ? element.filters : {};
    var $default_events = element.feed !== 'undefined' ? element.feed : [];
    var $default_mixins = [wcs_timetable_mixins];
    if( typeof element.css !== 'undefined' && typeof(document.getElementById("wcs_styles")) !== 'undefined' && document.getElementById("wcs_styles") != null ){
			document.getElementById("wcs_styles").innerHTML += element.css;
		}

    if( $default_options.mixins !== false ){
      var array = $default_options.mixins.split(' ');
      array.forEach(function(val){
        $default_mixins.push(window[val]);
      });

    }

    if( $default_options.is_single ) {

      wcs_apps[index] = new Vue({
        el: '#' + id,
        mounted: function() {
            var classes = [ 'wcs-vue--mounted' ];
            this.$el.className += ' ' + classes.join( ' ' );
        },
        template: '#wcs_templates_timetable--' + id,
        data: function(){
          return {
            css_classes: [],
            options: $default_options,
            single: $default_events,
            now: moment().utc()
          }
        },
        mixins: $default_mixins
      });

    }

    else {

      wcs_apps[index] = new Vue({
          el: '#' + id,
          template: '#wcs_templates_timetable--' + id,
          created: function() {
              var $self = this;
              if (typeof this.options.days === 'undefined' || ! this.options.days) {
                  this.options.days = 356;
              }
              if ( $default_events.length === 0 ) {
                  this.getEvents();
              } else {
                  $default_events.forEach(function(val, index, array) {
                      if ($self.events_hases.indexOf(val.hash) === -1) {
                          $self.events_hases.push(val.hash);
                          $self.filterEvent(val);
                      }
                  });
              }
          },
          computed: {
            schedule_events: function(){
              var vm = this;
              var limit = vm.getLimit();
              var events = [];
              var add = false;
              vm.events.forEach(function(o, index){
                add = false;
                if( ! vm.filter_var( vm.options.show_past_events ) ){
          				if( ! vm.filter_var( o.future ) && vm.filter_var( o.finished ) ){
          					add = true;
          				}
          			}
                if( ! add ) events.push(o);
              });
              if( limit > 0 ){
                events = vm.events.slice(0,limit);
              }
              return events;
            }
          },
          mounted: function() {
            this.css_classes.push( this.hasFilters() ? 'wcs-timetable--with-filters' : 'wcs-timetable--without-filters' );
            if( this.hasFilters() ){
              switch( true ){
                case parseInt( this.options.filters_position ) === 0 : this.css_classes.push('wcs-timetable--filters-left'); break;
                case parseInt( this.options.filters_position ) === 1 : this.css_classes.push('wcs-timetable--filters-center'); break;
                case parseInt( this.options.filters_position ) === 2 : this.css_classes.push('wcs-timetable--filters-right'); break;
              }
              this.css_classes.push( this.filter_var( this.options.show_filters_opened ) ? 'wcs-timetable--filters-expanded' : 'wcs-timetable--filters-closed' );
              this.css_classes.push( typeof this.options.label_toggle.length !== 'undefined' && this.options.label_toggle.length > 0 ? 'wcs-timetable--filters-with-toggle' : 'wcs-timetable--filters-without-toggle' );
            }
          },
          methods:{
            extendObject: function extend(obj, src) {
                Object.keys(src).forEach(function(key) { obj[key] = src[key]; });
                return obj;
            },
            apply_filters: function(){
              var args = Array.prototype.slice.call(arguments, 0);
            },
            get_utc_offset: function(){
              var vm = this;
              var offset = window.wcs_locale.gmtOffset;
              var sign = offset.toString().indexOf('-') === 0 ? '-' : '+';
              if( sign === '-' ){
                offset = offset.substring(1);
              }
              hours = parseInt( offset / 3600 );
              hours = hours < 10 ? '0' + hours : hours;
              minutes = offset % 3600;
              minutes = minutes < 10 ? '0' + minutes : minutes;
              var utc = sign + hours + ':' + minutes;
              return utc;
            }
          },
          data: function() {
              return {
                  lodash: $lodash,
                  el_id: id,
                  css_classes: [ 'wcs-timetable--style-' + $default_options.view ],
                  options: $default_options,
                  events: $default_events,
                  events_hases: [],
                  events_filtered: [],
                  filters: $default_filters,
                  filters_active: this.getActiveFilters($default_filters),
                  loading: false,
                  loading_process: false,
                  loading_history: [],
                  selected_day: false,
                  iso: false,
                  iso_expanded_items: [],
                  start: typeof $default_options.ts_start !== 'undefined' ? $default_options.ts_start : moment().utcOffset(this.get_utc_offset()).format('YYYY-MM-DD'),
                  stop: typeof $default_options.ts_start !== 'undefined' ? $default_options.ts_stop : moment().utcOffset(this.get_utc_offset()).add(parseInt($default_options.days) - 1, 'days').format('YYYY-MM-DD'),
                  today: moment().utcOffset(this.get_utc_offset()).format('YYYY-MM-DD'),
                  calendar: {},
                  calendarDay: null,
                  selectedDay: null,
                  dateRange: {
                    start: null,
                    stop: null
                  },
                  dateRangeHistory: [],
                  status: {
                    toggler: true
                  }
              };
          },
          mixins: $default_mixins
      });

    }

});
