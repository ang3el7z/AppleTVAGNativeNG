(function () {
  'use strict';

  if (window.__APPLETV_AGNATIVE_TOPNAV__) return;
  window.__APPLETV_AGNATIVE_TOPNAV__ = true;

  var STYLE_ID = 'appletv-agnative-topnav-style';
  var BODY_CLASS = 'appletv-agnative-topnav';
  var CLOCK_ID = 'agnative-topnav-clock';
  var TMDB_KEY = '4ef0d7355d9ffb5151e987764708ce96';
  var ENABLE_KEY = 'appletv_agnative_topnav_enabled';
  var GLARE_KEY = 'appletv_agnative_topnav_glare_enabled';
  var TOPNAV_ITEMS_KEY = 'appletv_agnative_topnav_items';
  var ITEMS_LINE_FONT_KEY = 'appletv_agnative_items_line_font_size';
  var LOGO_LANG_KEY = 'appletv_agnative_logo_lang';
  var BADGE_KEY = 'appletv_agnative_badge';
  var RATING_KEY = 'appletv_agnative_rating';
  var SETTINGS_COMPONENT = 'agnative';
  var TOPNAV_SETTINGS_COMPONENT = 'agnative_topnav';
  var ABOUT_SETTINGS_COMPONENT = 'agnative_about';
  var GLARE_CLASS = 'appletv-agnative-topnav-glare';
  var INPUT_KEYS_CLASS = 'appletv-agnative-input-keys';
  var INPUT_MOUSE_CLASS = 'appletv-agnative-input-mouse';
  var CONTRIBUTORS = ['nartes_ua', 'GwynnBleiidd', 'ManiacWithAxe'];

  var scheduled = false;
  var clockTimer = null;
  var logoCache = {};
  var logoPending = {};
  var storageListenerBound = false;
  var activityListenerBound = false;
  var fullListenerBound = false;
  var topnavSettingsOpen = false;
  var controlPanelOpen = false;
  var controlPanelPrevController = '';
  var controlPanelControllerReady = false;
  var controlPanelDocCloseBound = false;
  var inputModeListenerBound = false;
  var swallowClickUntil = 0;
  var reinitTimer = null;

  var I18N = {
    ru: {
      nav_main: 'Главная', nav_movie: 'Фильмы', nav_tv: 'Сериалы', nav_cartoon: 'Мультфильмы',
      nav_anime: 'Аниме', nav_release: 'Новинки', nav_collection: 'Подборки', nav_schedule: 'Расписание',
      nav_history: 'История', nav_bookmarks: 'Избранное', nav_notice: 'Уведомления', nav_feed: 'Лента', nav_console: 'Торренты',
      about_desc: 'Версия 0.1.2 • Автор llowmikee',
      about_title: 'О плагине',
      contributors_title: 'Помогали с разработкой',
      contributors_more: 'Список пополняется',
      main_title: 'Основные настройки',
      enable_name: 'AppleTV AgNative', enable_desc: 'Включает и выключает плагин',
      glare_name: 'Наклон veoveo.ru', glare_desc: 'от arabian_q',
      font_name: 'Размер шрифта полок', font_desc: '',
      topnav_name: 'Пункты Topnav', topnav_desc: 'Меню слева', topnav_title: 'Пункты верхнего меню', topnav_item_desc: 'Пункт menu_list: ',
      logo_lang_name: 'Язык логотипов', logo_lang_desc: 'Если логотипа на выбранном языке нет — используется английский',
      badge_name: 'Бейдж Фильм/Сериал', badge_desc: 'Авто отключает бейдж в разделах Фильмы и Сериалы',
      rating_name: 'Рейтинг TMDB', rating_desc: 'Показывать оценку в правом верхнем углу карточки',
      val_on: 'Включить', val_off: 'Выключить', val_add: 'Добавить', val_hide: 'Скрыть',
      val_auto: 'Авто', val_small: 'Мелкий', val_ru: 'Русский', val_en: 'Английский', val_uk: 'Украинский',
      badge_movie: 'ФИЛЬМ', badge_tv: 'СЕРИАЛ'
    },
    en: {
      nav_main: 'Home', nav_movie: 'Movies', nav_tv: 'TV Shows', nav_cartoon: 'Cartoons',
      nav_anime: 'Anime', nav_release: 'New', nav_collection: 'Collections', nav_schedule: 'Schedule',
      nav_history: 'History', nav_bookmarks: 'Favorites', nav_notice: 'Notifications', nav_feed: 'Feed', nav_console: 'Torrents',
      about_desc: 'Version 0.1.2 • Author llowmikee',
      about_title: 'About plugin',
      contributors_title: 'Helped with development',
      contributors_more: 'The list will grow',
      main_title: 'Main settings',
      enable_name: 'AppleTV AgNative', enable_desc: 'Enables and disables the plugin',
      glare_name: 'Tilt veoveo.ru', glare_desc: 'by arabian_q',
      font_name: 'Shelf font size', font_desc: '',
      topnav_name: 'Topnav items', topnav_desc: 'Left menu', topnav_title: 'Top navigation items', topnav_item_desc: 'menu_list item: ',
      logo_lang_name: 'Logo language', logo_lang_desc: 'If a logo is missing in the selected language, English is used',
      badge_name: 'Movie/TV badge', badge_desc: 'Auto disables the badge in Movies and TV sections',
      rating_name: 'TMDB rating', rating_desc: 'Show score in the top-right corner of cards',
      val_on: 'Enable', val_off: 'Disable', val_add: 'Add', val_hide: 'Hide',
      val_auto: 'Auto', val_small: 'Small', val_ru: 'Russian', val_en: 'English', val_uk: 'Ukrainian',
      badge_movie: 'MOVIE', badge_tv: 'TV SHOW'
    },
    uk: {
      nav_main: 'Головна', nav_movie: 'Фільми', nav_tv: 'Серіали', nav_cartoon: 'Мультфільми',
      nav_anime: 'Аніме', nav_release: 'Новинки', nav_collection: 'Добірки', nav_schedule: 'Розклад',
      nav_history: 'Історія', nav_bookmarks: 'Обране', nav_notice: 'Сповіщення', nav_feed: 'Стрічка', nav_console: 'Торренти',
      about_desc: 'Версія 0.1.2 • Автор llowmikee',
      about_title: 'Про плагін',
      contributors_title: 'Допомагали з розробкою',
      contributors_more: 'Список поповнюється',
      main_title: 'Основні налаштування',
      enable_name: 'AppleTV AgNative', enable_desc: 'Вмикає та вимикає плагін',
      glare_name: 'Нахил veoveo.ru', glare_desc: 'від arabian_q',
      font_name: 'Розмір шрифту полиць', font_desc: '',
      topnav_name: 'Пункти Topnav', topnav_desc: 'Меню ліворуч', topnav_title: 'Пункти верхнього меню', topnav_item_desc: 'Пункт menu_list: ',
      logo_lang_name: 'Мова логотипів', logo_lang_desc: 'Якщо логотипа обраною мовою немає — використовується англійський',
      badge_name: 'Бейдж Фільм/Серіал', badge_desc: 'Авто вимикає бейдж у розділах Фільми та Серіали',
      rating_name: 'Рейтинг TMDB', rating_desc: 'Показувати оцінку у правому верхньому куті картки',
      val_on: 'Увімкнути', val_off: 'Вимкнути', val_add: 'Додати', val_hide: 'Приховати',
      val_auto: 'Авто', val_small: 'Дрібний', val_ru: 'Російська', val_en: 'Англійська', val_uk: 'Українська',
      badge_movie: 'ФІЛЬМ', badge_tv: 'СЕРІАЛ'
    }
  };

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function pluginEnabled() {
    try {
      if (!window.Lampa || !Lampa.Storage) return true;
      return Lampa.Storage.get(ENABLE_KEY, 'on') !== 'off';
    } catch (e) {
      return true;
    }
  }

  function glareEnabled() {
    try {
      if (!window.Lampa || !Lampa.Storage) return true;
      return Lampa.Storage.get(GLARE_KEY, 'on') !== 'off';
    } catch (e) {
      return true;
    }
  }

  function getItemsLineFontMode() {
    try {
      if (!window.Lampa || !Lampa.Storage) return 'auto';
      var mode = Lampa.Storage.get(ITEMS_LINE_FONT_KEY, 'auto');
      if (mode !== 'auto' && mode !== 'small') return 'auto';
      return mode;
    } catch (e) {
      return 'auto';
    }
  }

  function detectSystemLang() {
    try {
      var lang = '';
      if (window.Lampa && Lampa.Storage) {
        lang = (Lampa.Storage.field && Lampa.Storage.field('language')) || Lampa.Storage.get('language') || '';
      }
      lang = String(lang || '').toLowerCase();
      if (lang.indexOf('uk') === 0 || lang === 'ua') return 'uk';
      if (lang.indexOf('en') === 0) return 'en';
      return 'ru';
    } catch (e) {
      return 'ru';
    }
  }

  function t(key) {
    var dict = I18N[detectSystemLang()] || I18N.ru;
    return dict[key] || I18N.ru[key] || key;
  }

  function getLogoLang() {
    try {
      if (!window.Lampa || !Lampa.Storage) return detectSystemLang();
      var value = Lampa.Storage.get(LOGO_LANG_KEY, 'auto');
      if (!value || value === 'auto') return detectSystemLang();
      if (value === 'ru' || value === 'uk' || value === 'en') return value;
      return detectSystemLang();
    } catch (e) {
      return detectSystemLang();
    }
  }

  function badgeEnabled() {
    try {
      if (!window.Lampa || !Lampa.Storage) return true;
      return Lampa.Storage.get(BADGE_KEY, 'auto') !== 'off';
    } catch (e) {
      return true;
    }
  }

  function getBadgeMode() {
    try {
      if (!window.Lampa || !Lampa.Storage) return 'auto';
      var mode = Lampa.Storage.get(BADGE_KEY, 'auto');
      if (mode !== 'auto' && mode !== 'on' && mode !== 'off') return 'auto';
      return mode;
    } catch (e) {
      return 'auto';
    }
  }

  function getCurrentMenuAction() {
    var activeTopnav = qs('.agnative-topnav-shell__item.is-active[data-action]');
    if (activeTopnav) return activeTopnav.getAttribute('data-action') || '';

    var active = qsa('.menu .menu__item.selector[data-action]').find(function (item) {
      return item.classList.contains('active') || item.classList.contains('focus') || item.classList.contains('hover') || item.classList.contains('traverse');
    });
    if (active) return active.getAttribute('data-action') || '';

    try {
      var activity = window.Lampa && Lampa.Activity && typeof Lampa.Activity.active === 'function' ? Lampa.Activity.active() : null;
      if (!activity) return '';

      var url = String(activity.url || '').toLowerCase();
      if (url === 'movie' || url === 'tv' || url === 'anime') return url;
      if (activity.component === 'category' && activity.genres === 16) return 'cartoon';
    } catch (e) { }

    return '';
  }

  function shouldShowBadge() {
    var mode = getBadgeMode();
    if (mode === 'off') return false;
    if (mode === 'on') return true;
    var action = getCurrentMenuAction();
    return action !== 'movie' && action !== 'tv';
  }

  function ratingEnabled() {
    try {
      if (!window.Lampa || !Lampa.Storage) return false;
      return Lampa.Storage.get(RATING_KEY, 'off') !== 'off';
    } catch (e) {
      return false;
    }
  }

  function resetCardDecor() {
    qsa('.card[data-nfx-switched]').forEach(function (card) {
      card.removeAttribute('data-nfx-switched');
      var overlay = card.querySelector('.nfx-card-overlay');
      if (overlay) overlay.remove();
      var badge = card.querySelector('.nfx-card-logo');
      if (badge) badge.remove();
      var rating = card.querySelector('.nfx-card-rating');
      if (rating) rating.remove();
    });
  }

  function sceneActive() {
    return true;
  }

  function removePluginUi() {
    try {
      closeControlPanel(false);
      if (document.body) document.body.classList.remove(BODY_CLASS);
      if (document.body) document.body.classList.remove(GLARE_CLASS);
      if (document.body) document.body.classList.remove(INPUT_KEYS_CLASS);
      if (document.body) document.body.classList.remove(INPUT_MOUSE_CLASS);
      var style = document.getElementById(STYLE_ID);
      if (style) style.remove();
      var shell = document.querySelector('.agnative-topnav-shell');
      if (shell) shell.remove();
      var right = document.querySelector('.agnative-topnav-right');
      if (right) right.remove();
      var panel = document.querySelector('.agnative-control-panel');
      if (panel) panel.remove();
      var clock = document.getElementById(CLOCK_ID);
      if (clock) clock.remove();
    } catch (e) { }
  }

  function openSettingsSection(name, back) {
    if (!name || !window.Lampa || !Lampa.Settings || !Lampa.Settings.create) return;
    setTimeout(function () {
      Lampa.Settings.create(name, back ? {
        onBack: function () {
          Lampa.Settings.create(back);
        }
      } : {});
    }, 0);
  }

  function openTopnavSettingsSection() {
    if (!window.Lampa || !Lampa.Settings || !Lampa.Settings.create) return;
    topnavSettingsOpen = true;
    setTimeout(function () {
      Lampa.Settings.create(TOPNAV_SETTINGS_COMPONENT, {
        onBack: function () {
          topnavSettingsOpen = false;
          Lampa.Settings.create(SETTINGS_COMPONENT);
          requestPluginReinit(60);
        }
      });
    }, 0);
  }

  function normalizeTopnavAction(action) {
    var value = String(action || '').trim().toLowerCase();
    if (!value) return '';
    if (value === 'release' || value === 'releases') return 'relise';
    if (value === 'bookmarks') return 'favorite';
    if (value === 'schedule') return 'timetable';
    if (value === 'collection' || value === 'collections') return 'catalog';
    return value;
  }

  function getFallbackTopnavItems() {
    return [
      { action: 'main', label: t('nav_main') },
      { action: 'movie', label: t('nav_movie') },
      { action: 'tv', label: t('nav_tv') },
      { action: 'cartoon', label: t('nav_cartoon') },
      { action: 'anime', label: t('nav_anime') },
      { action: 'relise', label: t('nav_release') },
      { action: 'catalog', label: t('nav_collection') },
      { action: 'timetable', label: t('nav_schedule') },
      { action: 'history', label: t('nav_history') },
      { action: 'favorite', label: t('nav_bookmarks') },
      { action: 'notice', label: t('nav_notice') },
      { action: 'feed', label: t('nav_feed') },
      { action: 'console', label: t('nav_console') }
    ];
  }

  function getAvailableTopnavItems() {
    var defs = [];
    var seen = {};

    qsa('.menu .menu__item.selector[data-action]').forEach(function (item) {
      var action = normalizeTopnavAction(item.getAttribute('data-action'));
      if (!action || seen[action]) return;
      if (action === 'search' || action === 'settings') return;
      var label = '';
      var labelNode = qs('.menu__text, .menu__item-name, .menu__item-text', item);
      if (labelNode) label = (labelNode.textContent || '').trim();
      if (!label) label = (item.textContent || '').trim();
      if (!label) label = action;
      seen[action] = true;
      defs.push({ action: action, label: label });
    });

    getFallbackTopnavItems().forEach(function (item) {
      if (seen[item.action]) return;
      seen[item.action] = true;
      defs.push(item);
    });

    return defs;
  }

  function getStoredTopnavActions() {
    try {
      if (!window.Lampa || !Lampa.Storage) return ['main', 'movie', 'tv', 'cartoon'];
      var raw = Lampa.Storage.get(TOPNAV_ITEMS_KEY, null);
      if (raw === null || typeof raw === 'undefined') return ['main', 'movie', 'tv', 'cartoon'];
      if (typeof raw === 'string') {
        try {
          raw = JSON.parse(raw);
        } catch (e) {
          raw = raw.split(',').map(function (item) { return item.trim(); }).filter(Boolean);
        }
      }
      var actions = Array.isArray(raw) ? raw : ['main', 'movie', 'tv', 'cartoon'];
      return actions.map(normalizeTopnavAction).filter(Boolean);
    } catch (e) {
      return ['main', 'movie', 'tv', 'cartoon'];
    }
  }

  function setStoredTopnavActions(actions) {
    try {
      if (!window.Lampa || !Lampa.Storage) return;
      Lampa.Storage.set(TOPNAV_ITEMS_KEY, actions);
    } catch (e) { }
  }

  function syncGlareClass() {
    if (!document.body) return;
    if (glareEnabled() && pluginEnabled()) document.body.classList.add(GLARE_CLASS);
    else document.body.classList.remove(GLARE_CLASS);
  }

  function setTopnavActionState(action, enabled) {
    var order = getAvailableTopnavItems().map(function (item) { return item.action; });
    var current = getStoredTopnavActions().filter(function (item, index, arr) {
      return item && arr.indexOf(item) === index;
    });

    if (enabled) {
      action = normalizeTopnavAction(action);
      if (action && current.indexOf(action) === -1) current.push(action);
    } else {
      action = normalizeTopnavAction(action);
      current = current.filter(function (item) { return item !== action; });
    }

    current.sort(function (a, b) {
      return order.indexOf(a) - order.indexOf(b);
    });

    setStoredTopnavActions(current);
  }

  function getSelectedTopnavItems() {
    var selected = getStoredTopnavActions();
    var map = {};
    getAvailableTopnavItems().forEach(function (item) {
      map[item.action] = item;
    });
    return selected.map(function (action) {
      return map[normalizeTopnavAction(action)];
    }).filter(Boolean);
  }

  function registerSettings() {
    try {
      if (!window.Lampa || !Lampa.SettingsApi || window.__APPLETV_AGNATIVE_TOPNAV_SETTINGS__) return;
      window.__APPLETV_AGNATIVE_TOPNAV_SETTINGS__ = true;

      if (Lampa.Template && Lampa.Template.add) {
        Lampa.Template.add('settings_' + SETTINGS_COMPONENT, '<div></div>');
        Lampa.Template.add('settings_' + TOPNAV_SETTINGS_COMPONENT, '<div></div>');
        Lampa.Template.add('settings_' + ABOUT_SETTINGS_COMPONENT, '<div></div>');
      }

      Lampa.SettingsApi.addComponent({
        component: SETTINGS_COMPONENT,
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-device-ipad-horizontal"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3 6a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-12" /><path d="M9 17h6" /></svg>',
        name: 'Agnative'
      });

      Lampa.SettingsApi.addParam({
        component: SETTINGS_COMPONENT,
        param: { name: 'agnative_about_info', type: 'button' },
        field: {
          name: 'AppleTV AgNative',
          description: t('about_desc')
        },
        onChange: function () {
          openSettingsSection(ABOUT_SETTINGS_COMPONENT, SETTINGS_COMPONENT);
        }
      });

      Lampa.SettingsApi.addParam({
        component: SETTINGS_COMPONENT,
        param: { type: 'title' },
        field: { name: t('main_title') }
      });

      Lampa.SettingsApi.addParam({
        component: SETTINGS_COMPONENT,
        param: {
          name: ENABLE_KEY,
          type: 'select',
          values: {
            on: t('val_on'),
            off: t('val_off')
          },
          default: 'on'
        },
        field: {
          name: t('enable_name'),
          description: t('enable_desc')
        },
        onChange: function (value) {
          if (value === 'off') {
            removePluginUi();
            return;
          }
          requestPluginReinit(60);
        }
      });

      Lampa.SettingsApi.addParam({
        component: SETTINGS_COMPONENT,
        param: {
          name: GLARE_KEY,
          type: 'select',
          values: {
            on: t('val_on'),
            off: t('val_off')
          },
          default: 'on'
        },
        field: {
          name: t('glare_name'),
          description: t('glare_desc')
        },
        onChange: function () {
          syncGlareClass();
        }
      });

      Lampa.SettingsApi.addParam({
        component: SETTINGS_COMPONENT,
        param: {
          name: ITEMS_LINE_FONT_KEY,
          type: 'select',
          values: {
            auto: t('val_auto'),
            small: t('val_small')
          },
          default: 'auto'
        },
        field: {
          name: t('font_name'),
          description: t('font_desc')
        },
        onChange: function () {
          injectStyle();
        }
      });

      Lampa.SettingsApi.addParam({
        component: SETTINGS_COMPONENT,
        param: {
          name: LOGO_LANG_KEY,
          type: 'select',
          values: {
            auto: t('val_auto'),
            ru: t('val_ru'),
            uk: t('val_uk'),
            en: t('val_en')
          },
          default: 'auto'
        },
        field: {
          name: t('logo_lang_name'),
          description: t('logo_lang_desc')
        },
        onChange: function () {
          logoCache = {};
          resetCardDecor();
          schedulePatch();
        }
      });

      Lampa.SettingsApi.addParam({
        component: SETTINGS_COMPONENT,
        param: {
          name: BADGE_KEY,
          type: 'select',
          values: { auto: t('val_auto'), on: t('val_on'), off: t('val_off') },
          default: 'auto'
        },
        field: {
          name: t('badge_name'),
          description: t('badge_desc')
        },
        onChange: function () {
          resetCardDecor();
          schedulePatch();
        }
      });

      Lampa.SettingsApi.addParam({
        component: SETTINGS_COMPONENT,
        param: {
          name: RATING_KEY,
          type: 'select',
          values: { on: t('val_on'), off: t('val_off') },
          default: 'off'
        },
        field: {
          name: t('rating_name'),
          description: t('rating_desc')
        },
        onChange: function () {
          resetCardDecor();
          schedulePatch();
        }
      });

      Lampa.SettingsApi.addParam({
        component: SETTINGS_COMPONENT,
        param: { name: 'agnative_open_topnav_settings', type: 'button' },
        field: {
          name: t('topnav_name'),
          description: t('topnav_desc')
        },
        onChange: function () {
          openTopnavSettingsSection();
        }
      });

      Lampa.SettingsApi.addParam({
        component: TOPNAV_SETTINGS_COMPONENT,
        param: { type: 'title' },
        field: { name: t('topnav_title') }
      });

      Lampa.SettingsApi.addParam({
        component: ABOUT_SETTINGS_COMPONENT,
        param: { type: 'title' },
        field: { name: t('about_title') }
      });

      Lampa.SettingsApi.addParam({
        component: ABOUT_SETTINGS_COMPONENT,
        param: { type: 'title' },
        field: { name: t('contributors_title') }
      });

      CONTRIBUTORS.forEach(function (name) {
        Lampa.SettingsApi.addParam({
          component: ABOUT_SETTINGS_COMPONENT,
          param: { name: 'agnative_contributor_' + name, type: 'static' },
          field: {
            name: name,
            description: ''
          }
        });
      });

      Lampa.SettingsApi.addParam({
        component: ABOUT_SETTINGS_COMPONENT,
        param: { name: 'agnative_contributors_more', type: 'static' },
        field: {
          name: t('contributors_more'),
          description: ''
        }
      });

      getAvailableTopnavItems().forEach(function (item) {
        Lampa.SettingsApi.addParam({
          component: TOPNAV_SETTINGS_COMPONENT,
          param: {
            name: 'agnative_topnav_item_' + item.action,
            type: 'select',
            values: {
              on: t('val_add'),
              off: t('val_hide')
            },
            default: getStoredTopnavActions().indexOf(item.action) > -1 ? 'on' : 'off'
          },
          field: {
            name: item.label,
            description: t('topnav_item_desc') + item.action
          },
          onChange: function (value) {
            setTopnavActionState(item.action, value !== 'off');
          }
        });
      });
    } catch (e) { }
  }

  function bindRuntimeListeners() {
    if (!window.Lampa || !Lampa.Listener || !Lampa.Storage || !Lampa.Storage.listener) return;

    if (!activityListenerBound) {
      activityListenerBound = true;
      Lampa.Listener.follow('activity', function (e) {
        if (!pluginEnabled()) return;
        if (e.type === 'start' || e.type === 'activity') {
          setTimeout(function () {
            try {
              var render = e.object && e.object.activity ? e.object.activity.render() : null;
              if (!render || !render.length) return;
              var body = render.find ? (render.find('.activity__body')[0] || render[0]) : render[0];
              if (!body) return;
              processCards(body);
            } catch (err) { }
          }, 500);
          schedulePatch();
        }
      });
    }

    if (!fullListenerBound) {
      fullListenerBound = true;
      Lampa.Listener.follow('full', function (e) {
        if (!pluginEnabled()) return;
        if (e.type === 'complite') {
          try {
            var render = e.object.activity.render();
            if (render && render.length) processCards(render[0]);
          } catch (err) { }
        }
      });
    }

    if (!storageListenerBound) {
      storageListenerBound = true;
      Lampa.Storage.listener.follow('change', function (e) {
        if (e.name === ENABLE_KEY) {
          if (pluginEnabled()) {
            requestPluginReinit(60);
          } else {
            removePluginUi();
          }
          return;
        }

        if (e.name === GLARE_KEY) {
          syncGlareClass();
          return;
        }

        if (e.name === LOGO_LANG_KEY || e.name === BADGE_KEY || e.name === RATING_KEY) {
          if (e.name === LOGO_LANG_KEY) logoCache = {};
          resetCardDecor();
          schedulePatch();
          return;
        }

        if (e.name === ITEMS_LINE_FONT_KEY) {
          injectStyle();
          return;
        }

        if (e.name === TOPNAV_ITEMS_KEY) {
          if (topnavSettingsOpen) return;
          requestPluginReinit(60);
          return;
        }

        if (e.name === 'lampac_theme' || e.name === 'lampac_interface_scene') {
          if (pluginEnabled()) {
            requestPluginReinit(60);
          } else {
            removePluginUi();
          }
        }
      });
    }
  }

  function requestPluginReinit(delay) {
    clearTimeout(reinitTimer);
    reinitTimer = setTimeout(function () {
      startPlugin();
      schedulePatch();
    }, typeof delay === 'number' ? delay : 60);
  }

  function consumeEvent(e) {
    if (!e) return;
    try {
      if (e.cancelable && typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    } catch (err) { }
  }

  function markSwallowClick(ms) {
    swallowClickUntil = Date.now() + (typeof ms === 'number' ? ms : 260);
  }

  function setInputMode(mode) {
    if (!document.body) return;
    if (mode === 'keys') {
      document.body.classList.add(INPUT_KEYS_CLASS);
      document.body.classList.remove(INPUT_MOUSE_CLASS);
      return;
    }
    if (mode === 'mouse') {
      document.body.classList.add(INPUT_MOUSE_CLASS);
      document.body.classList.remove(INPUT_KEYS_CLASS);
    }
  }

  function bindInputModeListeners() {
    if (inputModeListenerBound || !window || !window.addEventListener) return;
    inputModeListenerBound = true;

    window.addEventListener('keydown', function (e) {
      if (!pluginEnabled()) return;
      if (!e) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      var key = String(e.key || '');
      if (key === 'Shift' || key === 'Alt' || key === 'Control' || key === 'Meta') return;
      setInputMode('keys');
    }, true);

    var switchToMouse = function () {
      if (!pluginEnabled()) return;
      setInputMode('mouse');
    };

    window.addEventListener('mousemove', switchToMouse, true);
    window.addEventListener('mousedown', switchToMouse, true);
    window.addEventListener('wheel', switchToMouse, true);
    window.addEventListener('touchstart', switchToMouse, true);
  }

  function isMobile() {
    return window.innerWidth < 768 || (window.innerWidth < 1024 && 'ontouchstart' in window);
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function extractCardData(cardEl) {
    if (!cardEl) return null;
    try {
      if (cardEl.card_data) return cardEl.card_data;
    } catch (e) { }
    try {
      if (window.$) {
        var data = $(cardEl).data('card') || $(cardEl).data('json');
        if (data) return data;
      }
    } catch (e) { }
    return null;
  }

  var GENRE_MAP = {
    28: 'Боевик', 12: 'Приключения', 16: 'Мультфильм', 35: 'Комедия',
    80: 'Криминал', 99: 'Документальный', 18: 'Драма', 10751: 'Семейный',
    14: 'Фэнтези', 36: 'История', 27: 'Ужасы', 10402: 'Музыка',
    9648: 'Детектив', 10749: 'Мелодрама', 878: 'Фантастика',
    10770: 'Телефильм', 53: 'Триллер', 10752: 'Военный', 37: 'Вестерн',
    10759: 'Боевик', 10762: 'Детский', 10765: 'Фантастика', 10767: 'Ток-шоу'
  };

  function getGenreNames(item) {
    var names = [];
    if (!item) return names;
    if (item.genres && item.genres.length) {
      for (var i = 0; i < item.genres.length; i++) {
        if (item.genres[i] && item.genres[i].name) names.push(item.genres[i].name);
      }
    } else if (item.genre_ids && item.genre_ids.length) {
      for (var j = 0; j < item.genre_ids.length; j++) {
        if (GENRE_MAP[item.genre_ids[j]]) names.push(GENRE_MAP[item.genre_ids[j]]);
      }
    }
    return names;
  }

  function injectStyle() {
    if (!document.head && !document.body) return;
    var old = document.getElementById(STYLE_ID);
    if (old) old.remove();
    var itemsLineFontMode = getItemsLineFontMode();
    var itemsLineMoreRule = '';
    var itemsLineTitleRule = '';
    if (itemsLineFontMode === 'small') {
      itemsLineMoreRule = 'font-size:.65em !important; padding:.25em .5em !important;';
      itemsLineTitleRule = 'font-size:.53em !important;';
    } else if (itemsLineFontMode === 'auto') {
      itemsLineMoreRule = 'font-size:.83em !important; padding:.25em .5em !important;';
      itemsLineTitleRule = 'font-size:.83em !important;';
    }

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      'body.' + INPUT_KEYS_CLASS + ',',
      'body.' + INPUT_KEYS_CLASS + ' * {',
      '  cursor: none !important;',
      '}',
      'body.' + BODY_CLASS + ' .head,',
      'body.' + BODY_CLASS + ' .head__body,',
      'body.' + BODY_CLASS + ' .head__wrapper,',
      'body.' + BODY_CLASS + ' .head__layer {',
      '  background: transparent !important;',
      '  background-image: none !important;',
      '  border: none !important;',
      '  box-shadow: none !important;',
      '  filter: none !important;',
      '  backdrop-filter: none !important;',
      '  -webkit-backdrop-filter: none !important;',
      '}',
      'body.' + BODY_CLASS + ' .head__body {',
      '  position: relative !important;',
      '  z-index: 12 !important;',
      '  min-height: 0 !important;',
      '  height: 0 !important;',
      '  padding-top: 0 !important;',
      '  padding-bottom: 0 !important;',
      '  overflow: visible !important;',
      '}',
      'body.' + BODY_CLASS + ' .activity.activity--active,',
      'body.' + BODY_CLASS + ' .activity__body,',
      'body.' + BODY_CLASS + ' .full-start,',
      'body.' + BODY_CLASS + ' .full-start-new,',
      'body.' + BODY_CLASS + ' .full-start__head,',
      'body.' + BODY_CLASS + ' .full-start-new__head,',
      'body.' + BODY_CLASS + ' .full-start__body,',
      'body.' + BODY_CLASS + ' .full-start-new__body,',
      'body.' + BODY_CLASS + ' .full-start__bottom,',
      'body.' + BODY_CLASS + ' .full-start-new__bottom {',
      '  background: transparent !important;',
      '  background-image: none !important;',
      '  box-shadow: none !important;',
      '  filter: none !important;',
      '}',
      'body.' + BODY_CLASS + ' .activity.activity--active .full-start__background,',
      'body.' + BODY_CLASS + ' .full-start__background {',
      '  mask-image: none !important;',
      '  -webkit-mask-image: none !important;',
      '  filter: none !important;',
      '  animation: none !important;',
      '  transform: none !important;',
      '}',
      'body.' + BODY_CLASS + ' .full-start__status,',
      'body.' + BODY_CLASS + ' .full-start__reactions,',
      'body.' + BODY_CLASS + ' .full-start-new__reactions {',
      '  display: none !important;',
      '}',
      'body.' + BODY_CLASS + ' .wrap__content.layer--height.layer--width,',
      'body.' + BODY_CLASS + ' .wrap__content,',
      'body.' + BODY_CLASS + ' .layer--height,',
      'body.' + BODY_CLASS + ' .layer--width {',
      '  background: transparent !important;',
      '  background-image: none !important;',
      '  box-shadow: none !important;',
      '  filter: none !important;',
      '  backdrop-filter: none !important;',
      '  -webkit-backdrop-filter: none !important;',
      '  padding-top: .68em !important;',
      '}',
      'body.' + BODY_CLASS + ' .wrap__content.layer--height.layer--width > *,',
      'body.' + BODY_CLASS + ' .wrap__content > *,',
      'body.' + BODY_CLASS + ' .layer--height > *,',
      'body.' + BODY_CLASS + ' .layer--width > * {',
      '  background: transparent !important;',
      '  background-image: none !important;',
      '  box-shadow: none !important;',
      '  filter: none !important;',
      '  mask-image: none !important;',
      '  -webkit-mask-image: none !important;',
      '}',
      'body.' + BODY_CLASS + ' .settings__content.layer--height {',
      '  background: rgba(28,30,34,.82) !important;',
      '  background-image: none !important;',
      '  box-shadow: inset 0 1px 0 rgba(255,255,255,.05), 0 18px 44px rgba(0,0,0,.28) !important;',
      '  border: 1px solid rgba(255,255,255,.05) !important;',
      '  filter: none !important;',
      '  backdrop-filter: blur(18px) saturate(132%) !important;',
      '  -webkit-backdrop-filter: blur(18px) saturate(132%) !important;',
      '}',
      'body.' + BODY_CLASS + ' .selectbox__content.layer--height,',
      'body.' + BODY_CLASS + ' .settings-input__content.layer--height {',
      '  background: rgba(26,29,34,.9) !important;',
      '  background-image: none !important;',
      '  box-shadow: inset 0 1px 0 rgba(255,255,255,.05), 0 22px 54px rgba(0,0,0,.34) !important;',
      '  border: 1px solid rgba(255,255,255,.06) !important;',
      '  filter: none !important;',
      '  backdrop-filter: blur(20px) saturate(136%) !important;',
      '  -webkit-backdrop-filter: blur(20px) saturate(136%) !important;',
      '}',
      'body.' + BODY_CLASS + ' .wrap__left,',
      'body.' + BODY_CLASS + ' .menu,',
      'body.' + BODY_CLASS + ' .menu__content,',
      'body.' + BODY_CLASS + ' .menu .menu__list {',
      '  background: linear-gradient(180deg, rgba(255,255,255,.14), rgba(255,255,255,.06)) !important;',
      '  background-image: none !important;',
      '  box-shadow: 0 10px 24px rgba(0,0,0,.18) !important;',
      '  border: 0 !important;',
      '  backdrop-filter: none !important;',
      '  -webkit-backdrop-filter: none !important;',
      '}',
      'body.' + BODY_CLASS + ' .wrap__left::before,',
      'body.' + BODY_CLASS + ' .wrap__left::after,',
      'body.' + BODY_CLASS + ' .menu::before,',
      'body.' + BODY_CLASS + ' .menu::after,',
      'body.' + BODY_CLASS + ' .menu__content::before,',
      'body.' + BODY_CLASS + ' .menu__content::after,',
      'body.' + BODY_CLASS + ' .menu .menu__list::before,',
      'body.' + BODY_CLASS + ' .menu .menu__list::after {',
      '  display: none !important;',
      '  content: none !important;',
      '  border: 0 !important;',
      '  box-shadow: none !important;',
      '}',
      'body.' + BODY_CLASS + ' .menu .menu__item {',
      '  background: transparent !important;',
      '  border-radius: 999px !important;',
      '  border: 0 !important;',
      '  box-shadow: none !important;',
      '}',
      'body.' + BODY_CLASS + ' .menu .menu__item + .menu__item {',
      '  margin-top: .18em !important;',
      '}',
      'body.' + BODY_CLASS + ' .menu .menu__item.focus,',
      'body.' + BODY_CLASS + ' .menu .menu__item.hover,',
      'body.' + BODY_CLASS + ' .menu .menu__item.traverse,',
      'body.' + BODY_CLASS + ' .menu .menu__item.active {',
      '  background: rgba(255,255,255,.085) !important;',
      '  border-color: transparent !important;',
      '  box-shadow: inset 0 1px 0 rgba(255,255,255,.10) !important;',
      '}',
      'body.' + BODY_CLASS + ' .settings-param,',
      'body.' + BODY_CLASS + ' .settings-folder,',
      'body.' + BODY_CLASS + ' .selectbox-item {',
      '  background: rgba(28,30,34,.56) !important;',
      '  border-radius: 1.05em !important;',
      '  box-shadow: inset 0 1px 0 rgba(255,255,255,.04) !important;',
      '  border: 1px solid rgba(255,255,255,.04) !important;',
      '}',
      'body.' + BODY_CLASS + ' .settings-param + .settings-param,',
      'body.' + BODY_CLASS + ' .settings-folder + .settings-folder,',
      'body.' + BODY_CLASS + ' .settings-folder + .settings-param,',
      'body.' + BODY_CLASS + ' .settings-param + .settings-folder {',
      '  margin-top: .38em !important;',
      '}',
      'body.' + BODY_CLASS + ' .settings-param__name,',
      'body.' + BODY_CLASS + ' .settings-folder__name,',
      'body.' + BODY_CLASS + ' .settings-param__value,',
      'body.' + BODY_CLASS + ' .settings-param__descr,',
      'body.' + BODY_CLASS + ' .settings-folder__descr,',
      'body.' + BODY_CLASS + ' .selectbox-item__title,',
      'body.' + BODY_CLASS + ' .selectbox-item__subtitle {',
      '  position: relative !important;',
      '  z-index: 1 !important;',
      '}',
      'body.' + BODY_CLASS + ' .settings-param.focus,',
      'body.' + BODY_CLASS + ' .settings-folder.focus,',
      'body.' + BODY_CLASS + ' .selectbox-item.focus,',
      'body.' + BODY_CLASS + ' .settings-param.hover,',
      'body.' + BODY_CLASS + ' .settings-folder.hover,',
      'body.' + BODY_CLASS + ' .selectbox-item.hover {',
      '  background: rgba(255,255,255,.085) !important;',
      '  box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 0 0 1px rgba(255,255,255,.08) !important;',
      '  border-color: rgba(255,255,255,.10) !important;',
      '}',
      'body.' + BODY_CLASS + ' .settings-folder.focus::before,',
      'body.' + BODY_CLASS + ' .settings-folder.focus::after,',
      'body.' + BODY_CLASS + ' .settings-param.focus::before,',
      'body.' + BODY_CLASS + ' .settings-param.focus::after,',
      'body.' + BODY_CLASS + ' .selectbox-item.focus::before,',
      'body.' + BODY_CLASS + ' .selectbox-item.focus::after {',
      '  display: none !important;',
      '  content: none !important;',
      '}',
      'body.' + BODY_CLASS + ' .wrap__content.layer--height.layer--width::after,',
      'body.' + BODY_CLASS + ' .wrap__content.layer--height.layer--width > *::before,',
      'body.' + BODY_CLASS + ' .wrap__content.layer--height.layer--width > *::after,',
      'body.' + BODY_CLASS + ' .wrap__content::after,',
      'body.' + BODY_CLASS + ' .wrap__content > *::before,',
      'body.' + BODY_CLASS + ' .wrap__content > *::after,',
      'body.' + BODY_CLASS + ' .layer--height::after,',
      'body.' + BODY_CLASS + ' .layer--height > *::before,',
      'body.' + BODY_CLASS + ' .layer--height > *::after,',
      'body.' + BODY_CLASS + ' .layer--width > *::before,',
      'body.' + BODY_CLASS + ' .layer--width > *::after,',
      'body.' + BODY_CLASS + ' .layer--width::after {',
      '  content: none !important;',
      '  display: none !important;',
      '  background: transparent !important;',
      '  background-image: none !important;',
      '  box-shadow: none !important;',
      '  mask-image: none !important;',
      '  -webkit-mask-image: none !important;',
      '}',
      'body.' + BODY_CLASS + ' .head__title,',
      'body.' + BODY_CLASS + ' .head__time,',
      'body.' + BODY_CLASS + ' .head__split,',
      'body.' + BODY_CLASS + ' .head__logo,',
      'body.' + BODY_CLASS + ' .head__history,',
      'body.' + BODY_CLASS + ' .head__source,',
      'body.' + BODY_CLASS + ' .head__markers,',
      'body.' + BODY_CLASS + ' .head__backward,',
      'body.' + BODY_CLASS + ' .open--search,',
      'body.' + BODY_CLASS + ' .head__settings,',
      'body.' + BODY_CLASS + ' .settings-icon-holder,',
      'body.' + BODY_CLASS + ' .head__action,',
      'body.' + BODY_CLASS + ' .head__button {',
      '  display: none !important;',
      '}',
      'body.' + BODY_CLASS + ' .head__menu-icon {',
      '  position: absolute !important;',
      '  left: 1em !important;',
      '  top: .46em !important;',
      '  transform: none !important;',
      '  z-index: 20 !important;',
      '  width: 2.6em !important;',
      '  height: 2.6em !important;',
      '  min-width: 2.6em !important;',
      '  margin: 0 !important;',
      '  padding: 0 !important;',
      '  display: inline-flex !important;',
      '  align-items: center !important;',
      '  justify-content: center !important;',
      '  border-radius: 999px !important;',
      '  background: rgba(22,24,30,.26) !important;',
      '  border: 1px solid rgba(255,255,255,.10) !important;',
      '  box-shadow: inset 0 1px 0 rgba(255,255,255,.10), 0 8px 18px rgba(0,0,0,.12) !important;',
      '  backdrop-filter: blur(18px) saturate(140%) !important;',
      '  -webkit-backdrop-filter: blur(18px) saturate(140%) !important;',
      '  color: rgba(255,255,255,.95) !important;',
      '}',
      'body.' + BODY_CLASS + ' .head__menu-icon > *,',
      'body.' + BODY_CLASS + ' .head__menu-icon svg,',
      'body.' + BODY_CLASS + ' .head__menu-icon img {',
      '  width: 1.1em !important;',
      '  height: 1.1em !important;',
      '  max-width: 1.1em !important;',
      '  max-height: 1.1em !important;',
      '}',
      'body.' + BODY_CLASS + ' .head::before,',              //vot i mainer
      'body.' + BODY_CLASS + ' .head::after,',
      'body.' + BODY_CLASS + ' .head__body::before,',
      'body.' + BODY_CLASS + ' .head__body::after,',
      'body.' + BODY_CLASS + ' .head__wrapper::before,',
      'body.' + BODY_CLASS + ' .head__wrapper::after,',
      'body.' + BODY_CLASS + ' .head__layer::before,',
      'body.' + BODY_CLASS + ' .head__layer::after {',
      '  content: none !important;',
      '  display: none !important;',
      '  filter: none !important;',
      '  backdrop-filter: none !important;',
      '  -webkit-backdrop-filter: none !important;',
      '  background: transparent !important;',
      '  box-shadow: none !important;',
      '}',
      'body.' + BODY_CLASS + ' .agnative-topnav-shell { position:absolute; left:0; right:0; top:.46em; z-index:20; }',
      'body.' + BODY_CLASS + ' .agnative-topnav-shell__inner { margin:0 auto; width:max-content; display:inline-flex; align-items:center; gap:.18em; padding:.22em .32em; border-radius:999px; background:rgba(22,24,30,.28); border:1px solid rgba(255,255,255,.10); box-shadow:inset 0 1px 0 rgba(255,255,255,.10), 0 8px 18px rgba(0,0,0,.12); backdrop-filter:blur(18px) saturate(140%); -webkit-backdrop-filter:blur(18px) saturate(140%); position:relative; left:50%; transform:translateX(-50%); }',
      'body.' + BODY_CLASS + ' .agnative-topnav-shell__items { display:flex; align-items:center; justify-content:center; gap:.08em; }',
      'body.' + BODY_CLASS + ' .agnative-topnav-right { position:absolute; right:1.15em; top:0; z-index:23; display:inline-flex; align-items:center; gap:.08em; padding:.22em .32em; border-radius:999px; background:rgba(22,24,30,.28); border:1px solid rgba(255,255,255,.10); box-shadow:inset 0 1px 0 rgba(255,255,255,.10), 0 8px 18px rgba(0,0,0,.12); backdrop-filter:blur(18px) saturate(140%); -webkit-backdrop-filter:blur(18px) saturate(140%); }',
      'body.' + BODY_CLASS + ' .agnative-topnav-shell__item.selector { appearance:none; -webkit-appearance:none; border:0; background:none; color:rgba(255,255,255,.92); height:2.16em; display:inline-flex; align-items:center; justify-content:center; text-align:center; padding:0 .96em; border-radius:999px; font-size:.83em; font-weight:700; line-height:1; white-space:nowrap; transition:background .2s ease, transform .2s ease, box-shadow .2s ease; }',
      'body.' + BODY_CLASS + ' .agnative-topnav-shell__item--icon.selector { width:2.16em; min-width:2.16em; padding:0; }',
      'body.' + BODY_CLASS + ' .agnative-topnav-shell__item--icon svg { width:1em; height:1em; }',
      'body.' + BODY_CLASS + ' .agnative-topnav-shell__clock.selector { min-width:4.2em; padding:0 .95em; font-size:.92em; letter-spacing:.01em; }',
      'body.' + BODY_CLASS + ' .agnative-topnav-shell__clock-time { display:block; min-width:3.4em; text-align:center; }',
      'body.' + BODY_CLASS + ' .agnative-topnav-right__profile.selector { width:2.16em; min-width:2.16em; padding:0; overflow:hidden; }',
      'body.' + BODY_CLASS + ' .agnative-topnav-right__profile-img { width:1.56em; height:1.56em; border-radius:999px; object-fit:cover; display:block; }',
      'body.' + BODY_CLASS + ' .agnative-topnav-shell__item.is-active, body.' + BODY_CLASS + ' .agnative-topnav-shell__item.hover, body.' + BODY_CLASS + ' .agnative-topnav-shell__item.focus { background:rgba(255,255,255,.14); box-shadow:inset 0 1px 0 rgba(255,255,255,.10); }',
      'body.' + BODY_CLASS + ' .agnative-control-panel { position:absolute; right:1.15em; top:3.7em; z-index:26; width:18.8em; padding:.72em; border-radius:1.18em; background:rgba(40,48,62,.76); border:1px solid rgba(255,255,255,.13); box-shadow:0 18px 48px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.09); backdrop-filter:blur(22px) saturate(136%); -webkit-backdrop-filter:blur(22px) saturate(136%); opacity:0; transform:translateY(-.35em) scale(.98); pointer-events:none; transition:opacity .2s ease, transform .2s ease; }',
      'body.' + BODY_CLASS + ' .agnative-control-panel.is-open { opacity:1; transform:translateY(0) scale(1); pointer-events:auto; }',
      'body.' + BODY_CLASS + ' .agnative-control-panel__title { font-size:1.28em; font-weight:600; color:rgba(255,255,255,.94); padding:.18em .15em .52em; }',
      'body.' + BODY_CLASS + ' .agnative-control-panel__grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.48em; }',
      'body.' + BODY_CLASS + ' .agnative-control-panel__tile.selector { min-height:5.2em; border-radius:.95em; background:rgba(16,20,28,.82); border:1px solid rgba(255,255,255,.10); display:flex; flex-direction:column; align-items:flex-start; justify-content:center; gap:.34em; padding:.65em .72em; color:rgba(255,255,255,.95); transition:background .2s ease, box-shadow .2s ease, transform .2s ease; }',
      'body.' + BODY_CLASS + ' .agnative-control-panel__tile.selector .agnative-control-panel__icon { width:1.3em; height:1.3em; display:inline-flex; align-items:center; justify-content:center; color:rgba(214,230,255,.97); }',
      'body.' + BODY_CLASS + ' .agnative-control-panel__tile.selector .agnative-control-panel__icon svg { width:1.3em; height:1.3em; }',
      'body.' + BODY_CLASS + ' .agnative-control-panel__tile.selector .agnative-control-panel__label { font-size:.95em; font-weight:700; line-height:1.15; text-align:left; }',
      'body.' + BODY_CLASS + ' .agnative-control-panel__tile.selector.hover, body.' + BODY_CLASS + ' .agnative-control-panel__tile.selector.focus { background:rgba(255,255,255,.18); box-shadow:inset 0 1px 0 rgba(255,255,255,.18), 0 0 0 1px rgba(255,255,255,.12); transform:translateY(-.02em); }',
      'body.' + BODY_CLASS + ' .items-line--type-default { min-height:auto !important; padding-top:0 !important; padding-bottom:.12em !important; margin-bottom:.32em !important; }',
      'body.' + BODY_CLASS + ' .items-line--type-default .items-line__head { margin-bottom:.58em !important; min-height:auto !important; padding-top:0 !important; padding-bottom:0 !important; padding-left:1.05em !important; padding-right:1.05em !important; font-size:1.14em !important; }',
      'body.' + BODY_CLASS + ' .items-line__more.selector { ' + itemsLineMoreRule + ' opacity:.8 !important; }',
      'body.' + BODY_CLASS + ' .items-line--type-default .items-cards { padding-top:0 !important; font-size:.86em !important; }',
      'body.' + BODY_CLASS + ' .items-cards { padding-left:1.05em !important; padding-right:1.05em !important; gap:.62em !important; }',
      'body.' + BODY_CLASS + ' .items-line__body { padding-left:1.15em !important; }',
      'body.' + BODY_CLASS + ' .items-line__title { ' + itemsLineTitleRule + ' }',
      'body.' + BODY_CLASS + ' .card { width:17.6em !important; margin-right:.52em !important; margin-bottom:.45em !important; padding-bottom:0 !important; transform-origin:center center !important; overflow:visible !important; }',
      'body.' + BODY_CLASS + ' .card .card__view { padding-bottom:56.25% !important; margin-bottom:0 !important; border-radius:1.35em !important; overflow:hidden !important; clip-path: inset(0 round 1.35em); -webkit-clip-path: inset(0 round 1.35em); box-shadow: inset 0 1px 0 rgba(255,255,255,.16), inset 0 -1px 0 rgba(255,255,255,.04), 0 8px 18px rgba(0,0,0,.18) !important; transition: transform .28s cubic-bezier(.22,.61,.36,1), box-shadow .28s ease, filter .28s ease, opacity .18s ease !important; }',
      'body.' + BODY_CLASS + ' .card[data-nfx-switched="1"] .card__view { opacity:1 !important; }',
      'body.' + BODY_CLASS + ' .card__view > *, body.' + BODY_CLASS + ' .card__view img, body.' + BODY_CLASS + ' .card__view .card__img, body.' + BODY_CLASS + ' .card__view .card__image, body.' + BODY_CLASS + ' .card__img, body.' + BODY_CLASS + ' .card__image, body.' + BODY_CLASS + ' .card__filter, body.' + BODY_CLASS + ' .card__filter::before, body.' + BODY_CLASS + ' .card__filter::after { border-radius:1.35em !important; }',
      'body.' + BODY_CLASS + ' .card__img, body.' + BODY_CLASS + ' .card__image { object-fit:cover !important; object-position:center 20% !important; border:none !important; box-shadow:none !important; background-clip:padding-box !important; }',
      'body.' + BODY_CLASS + ' .card.focus .card__view { transform: translateY(-.08em) scale(1.06) !important; filter: saturate(1.06) brightness(1.02) !important; box-shadow: inset 0 1px 0 rgba(255,255,255,.22), 0 0 0 2px rgba(86,141,255,.92), 0 18px 42px rgba(0,0,0,.26), 0 8px 20px rgba(0,0,0,.14) !important; }',
      'body.' + BODY_CLASS + ' .card.hover .card__view { transform: translateY(-.04em) scale(1.03) !important; filter: saturate(1.02) brightness(1.01) !important; box-shadow: inset 0 1px 0 rgba(255,255,255,.18), 0 10px 24px rgba(0,0,0,.16) !important; }',
      'body.' + BODY_CLASS + ' .card.focus::after, body.' + BODY_CLASS + ' .card.hover::after, body.' + BODY_CLASS + ' .card__view::before, body.' + BODY_CLASS + ' .card__view::after { display:none !important; content:none !important; }',
      'body.' + GLARE_CLASS + ' .card, body.' + GLARE_CLASS + ' .card-episode, body.' + GLARE_CLASS + ' .full-start-new__poster { will-change: transform; transform-style: preserve-3d; }',
      'body.' + GLARE_CLASS + ' .card__view, body.' + GLARE_CLASS + ' .full-episode__img, body.' + GLARE_CLASS + ' .full-start-new__poster { position: relative; overflow: hidden; }',
      'body.' + GLARE_CLASS + ' .card .card__view::after, body.' + GLARE_CLASS + ' .card-episode .full-episode__img::after, body.' + GLARE_CLASS + ' .full-start-new__poster::after { content:"" !important; display:block !important; position:absolute; inset:-10%; border-radius:inherit; background: radial-gradient(ellipse at var(--gx, 50%) var(--gy, 50%), rgba(255,255,255,.20) 0%, rgba(255,255,255,.16) 12%, rgba(255,255,255,.10) 26%, rgba(255,255,255,.05) 42%, rgba(255,255,255,.02) 58%, rgba(255,255,255,0) 78%) !important; opacity:0; filter: blur(18px); transition: opacity .22s ease, transform .22s ease; pointer-events:none; z-index:8; mix-blend-mode: screen; }',
      'body.' + GLARE_CLASS + ' .card.focus .card__view::after, body.' + GLARE_CLASS + ' .card.hover .card__view::after, body.' + GLARE_CLASS + ' .card-episode.focus .full-episode__img::after, body.' + GLARE_CLASS + ' .card-episode.hover .full-episode__img::after, body.' + GLARE_CLASS + ' .full-start-new__poster.focus::after, body.' + GLARE_CLASS + ' .full-start-new__poster.hover::after { opacity: 1 !important; }',
      'body.' + GLARE_CLASS + ' .card.focus .card__view, body.' + GLARE_CLASS + ' .card.hover .card__view, body.' + GLARE_CLASS + ' .card-episode.focus, body.' + GLARE_CLASS + ' .card-episode.hover, body.' + GLARE_CLASS + ' .full-start-new__poster.focus, body.' + GLARE_CLASS + ' .full-start-new__poster.hover { transform: perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) scale(1.055) translateY(-.06em) !important; }',
      'body.' + BODY_CLASS + ' .card__vote, body.' + BODY_CLASS + ' .card__quality, body.' + BODY_CLASS + ' .card__type, body.' + BODY_CLASS + ' .card__promo-text, body.' + BODY_CLASS + ' .card__promo-title, body.' + BODY_CLASS + ' .full-person__photo, body.' + BODY_CLASS + ' .nfx-card-overlay__match { display:none !important; }',
      'body.' + BODY_CLASS + ' .card__title, body.' + BODY_CLASS + ' .card__age { display:none !important; }',
      'body.' + BODY_CLASS + ' .nfx-card-overlay { position:absolute; left:0; right:0; bottom:0; z-index:3; display:block !important; opacity:1 !important; visibility:visible !important; border-radius:0 0 1.35em 1.35em !important; background:linear-gradient(0deg, rgba(6,8,14,.88) 0%, rgba(6,8,14,.56) 38%, rgba(6,8,14,.16) 68%, rgba(6,8,14,0) 100%) !important; padding:2.15em 1.02em .92em !important; transform: translateZ(14px); transition: transform .28s cubic-bezier(.22,.61,.36,1), opacity .24s ease; pointer-events:none; }',
      'body.' + BODY_CLASS + ' .card.focus .nfx-card-overlay { transform: translateZ(18px) translateY(-.02em); }',
      'body.' + BODY_CLASS + ' .nfx-card-overlay__logo, body.' + BODY_CLASS + ' img.nfx-card-overlay__logo { display:block !important; opacity:1 !important; visibility:visible !important; max-height:2.55em !important; max-width:82% !important; margin-bottom:.28em !important; border-radius:0 !important; clip-path:none !important; -webkit-clip-path:none !important; mask-image:none !important; -webkit-mask-image:none !important; overflow:visible !important; }',
      'body.' + BODY_CLASS + ' .nfx-card-overlay__title { color:#fff; font-size:1.02em !important; line-height:1.14 !important; font-weight:800 !important; text-shadow:0 2px 12px rgba(0,0,0,.5); }',
      'body.' + BODY_CLASS + ' .nfx-card-overlay__meta { color:rgba(255,255,255,.88); font-size:.74em !important; margin-top:.2em !important; line-height:1.28 !important; white-space:normal !important; max-width:100% !important; text-shadow:0 1px 8px rgba(0,0,0,.45); }',
      'body.' + BODY_CLASS + ' .nfx-card-logo { position:absolute; top:.7em; left:.82em; z-index:4; display:inline-flex !important; opacity:1 !important; visibility:visible !important; align-items:center; justify-content:center; padding:.38em .88em; border-radius:.92em; background:rgba(12,14,20,.62); border:1px solid rgba(255,255,255,.12); color:rgba(255,255,255,.96); font-size:.74em; font-weight:800; letter-spacing:.05em; backdrop-filter: blur(10px) saturate(140%); -webkit-backdrop-filter: blur(10px) saturate(140%); pointer-events:none; }',
      'body.' + BODY_CLASS + ' .nfx-card-rating { position:absolute; top:.7em; right:.82em; z-index:4; display:inline-flex; align-items:center; justify-content:center; padding:.34em .68em; border-radius:.92em; background:rgba(12,14,20,.68); border:1px solid rgba(255,255,255,.12); color:rgba(255,255,255,.96); font-size:.74em; font-weight:800; letter-spacing:.02em; backdrop-filter: blur(10px) saturate(140%); -webkit-backdrop-filter: blur(10px) saturate(140%); pointer-events:none; }'
    ].join('\n');
    if (document.body) document.body.appendChild(style);
    else document.head.appendChild(style);
  }

  function iconSearch() {
    return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="2"></circle><path d="M16 16L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>';
  }

  function iconSettings() {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M19.875 6.27a2.225 2.225 0 0 1 1.125 1.948v7.284c0 .809 -.443 1.555 -1.158 1.948l-6.75 4.27a2.269 2.269 0 0 1 -2.184 0l-6.75 -4.27a2.225 2.225 0 0 1 -1.158 -1.948v-7.285c0 -.809 .443 -1.554 1.158 -1.947l6.75 -3.98a2.33 2.33 0 0 1 2.25 0l6.75 3.98h-.033"/><path d="M9 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/></svg>';
  }

  function iconProfile() {
    return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="4.1" stroke="currentColor" stroke-width="2"></circle><path d="M4 20c0-3.9 3.8-6 8-6s8 2.1 8 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>';
  }

  function iconFavorite() {
    return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 3.5H15.5C17.433 3.5 19 5.067 19 7V21L12 17.1L5 21V7C5 5.067 6.567 3.5 8.5 3.5H7Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path></svg>';
  }

  function iconSync() {
    return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 12a8 8 0 0 0-13.66-5.66" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M4 5v4h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M4 12a8 8 0 0 0 13.66 5.66" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M20 19v-4h-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
  }

  function iconPlayer() {
    return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" stroke-width="2"></rect><path d="M10 9.5L15 12L10 14.5V9.5Z" fill="currentColor"></path></svg>';
  }

  function iconData() {
    return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="12" cy="6" rx="7" ry="3" stroke="currentColor" stroke-width="2"></ellipse><path d="M5 6V18C5 19.66 8.13 21 12 21C15.87 21 19 19.66 19 18V6" stroke="currentColor" stroke-width="2"></path><path d="M5 12C5 13.66 8.13 15 12 15C15.87 15 19 13.66 19 12" stroke="currentColor" stroke-width="2"></path></svg>';
  }

  function getProfileButtonHtml() {
    try {
      var permit = window.Lampa && Lampa.Account && Lampa.Account.Permit ? Lampa.Account.Permit : null;
      var profile = permit && permit.account ? permit.account.profile : null;
      var icon = profile && profile.icon ? profile.icon : '';
      var protocol = window.Lampa && Lampa.Utils && typeof Lampa.Utils.protocol === 'function' ? Lampa.Utils.protocol() : '';
      var domain = window.Lampa && Lampa.Manifest ? Lampa.Manifest.cub_domain : '';
      if (icon && protocol && domain) {
        return '<img class="agnative-topnav-right__profile-img" src="' + protocol + domain + '/img/profiles/' + icon + '.png" alt="profile">';
      }
    } catch (e) { }
    return iconProfile();
  }

  function triggerSelectorEvent(node, eventName) {
    if (!node || !eventName) return false;
    try {
      if (window.$) {
        $(node).trigger(eventName);
        return true;
      }
    } catch (e) { }
    return false;
  }

  function triggerSelectorEnter(node) {
    if (!node) return false;
    var entered = false;
    entered = triggerSelectorEvent(node, 'hover:focus') || entered;
    entered = triggerSelectorEvent(node, 'hover:enter') || entered;

    if (entered) return true;

    // Fallback for edge cases where selector handlers are unavailable.
    try {
      if (typeof node.click === 'function') node.click();
      else node.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return true;
    } catch (e) { }
    return false;
  }

  function getMenuItem(action) {
    action = normalizeTopnavAction(action);
    return qs('.menu .menu__item.selector[data-action="' + action + '"]');
  }

  function triggerMenuAction(action) {
    action = normalizeTopnavAction(action);
    try {
      if (!window.Lampa) return false;
      var nativeMenuItem = getMenuItem(action);
      if (nativeMenuItem && triggerSelectorEnter(nativeMenuItem)) return true;

      var Storage = Lampa.Storage;
      var Lang = Lampa.Lang;
      if (!Storage || !Lang || !Lampa.Activity) return false;

      if (action === 'movie' || action === 'tv' || action === 'anime') {
        Lampa.Activity.push({
          url: action,
          title: (action === 'movie' ? Lang.translate('menu_movies') : action === 'anime' ? Lang.translate('menu_anime') : Lang.translate('menu_tv')) + ' - ' + Storage.field('source').toUpperCase(),
          component: 'category',
          source: action === 'anime' ? 'cub' : Storage.field('source'),
          page: 1
        });
        return true;
      }

      if (action === 'cartoon') {
        Lampa.Activity.push({
          url: 'movie',
          title: Lang.translate('menu_multmovie') + ' - ' + Storage.field('source').toUpperCase(),
          component: 'category',
          genres: 16,
          page: 1
        });
        return true;
      }

      if (action === 'main') {
        Lampa.Activity.push({
          url: '',
          title: Lang.translate('title_main') + ' - ' + Storage.field('source').toUpperCase(),
          component: 'main',
          source: Storage.field('source')
        });
        return true;
      }
    } catch (e) { }
    return false;
  }

  function triggerSearch() {
    closeControlPanel(false);
    try {
      var menuItem = getMenuItem('search');
      if (menuItem && triggerSelectorEnter(menuItem)) return true;

      if (window.Lampa && Lampa.Search && typeof Lampa.Search.open === 'function') {
        Lampa.Search.open({});
        return true;
      }
    } catch (e) { }
    return false;
  }

  function triggerSettings() {
    closeControlPanel(false);
    try {
      var menuItem = getMenuItem('settings');
      if (menuItem) {
        triggerSelectorEnter(menuItem);
        return true;
      }

      if (window.Lampa && Lampa.ParentalControl && typeof Lampa.ParentalControl.personal === 'function') {
        Lampa.ParentalControl.personal('settings', function () {
          var nativeBtn = qs('.head__settings, .settings-icon-holder, .head__action.open--settings, .open--settings');
          if (nativeBtn) {
            triggerSelectorEnter(nativeBtn);
            return;
          }
          if (Lampa.Controller && typeof Lampa.Controller.toggle === 'function') {
            Lampa.Controller.toggle('settings');
          }
        }, false, true);
        return true;
      }
    } catch (e) { }
    return false;
  }

  function openSettingsComponent(componentName) {
    try {
      if (!window.Lampa) return false;
      if (Lampa.Controller && typeof Lampa.Controller.toggle === 'function') {
        Lampa.Controller.toggle('settings');
      }
      if (Lampa.Settings && typeof Lampa.Settings.create === 'function') {
        setTimeout(function () {
          try {
            Lampa.Settings.create(componentName);
          } catch (e) {
            if (componentName !== 'more') Lampa.Settings.create('more');
          }
        }, 40);
        return true;
      }
    } catch (e) { }
    return triggerSettings();
  }

  function triggerSyncSettings() {
    closeControlPanel(false);
    return openSettingsComponent('account');
  }

  function triggerPlayerSettings() {
    closeControlPanel(false);
    return openSettingsComponent('player');
  }

  function triggerCacheDataSettings() {
    closeControlPanel(false);
    return openSettingsComponent('data');
  }

  function triggerFavorite() {
    closeControlPanel(false);
    try {
      var menuItem = getMenuItem('favorite');
      if (menuItem && triggerSelectorEnter(menuItem)) return true;

      if (window.Lampa && Lampa.ParentalControl && typeof Lampa.ParentalControl.personal === 'function' && Lampa.Activity && Lampa.Lang) {
        Lampa.ParentalControl.personal('bookmarks', function () {
          Lampa.Activity.push({ component: 'bookmarks', title: Lampa.Lang.translate('settings_input_links') });
        }, false, true);
        return true;
      }
    } catch (e) { }
    return false;
  }

  function langText(key, fallback) {
    try {
      if (window.Lampa && Lampa.Lang && typeof Lampa.Lang.translate === 'function') {
        var value = Lampa.Lang.translate(key);
        if (value && value !== key) return value;
      }
    } catch (e) { }
    return fallback;
  }

  function triggerProfile() {
    closeControlPanel(false);
    try {
      var openProfilesDirect = function () {
        if (window.Lampa && Lampa.Account && Lampa.Account.Profile && typeof Lampa.Account.Profile.select === 'function') {
          Lampa.Account.Profile.select(function () {
            if (window.Lampa && Lampa.Controller && typeof Lampa.Controller.toggle === 'function') {
              Lampa.Controller.toggle('head');
            }
          });
          return true;
        }

        if (window.Lampa && Lampa.Account && typeof Lampa.Account.showProfiles === 'function') {
          Lampa.Account.showProfiles(function () {
            if (window.Lampa && Lampa.Controller && typeof Lampa.Controller.toggle === 'function') {
              Lampa.Controller.toggle('head');
            }
          });
          return true;
        }
        return false;
      };

      var nativeBtn = qs('.head__action.open--profile, .open--profile');
      if (nativeBtn) {
        triggerSelectorEnter(nativeBtn);
        setTimeout(function () {
          if (!document.body) return;
          if (document.body.classList.contains('selectbox--open')) return;
          openProfilesDirect();
        }, 80);
        return true;
      }

      return openProfilesDirect();
    } catch (e) { }
    return false;
  }

  function bindControlPanelOutsideClose() {
    if (controlPanelDocCloseBound || !document || !document.addEventListener) return;
    controlPanelDocCloseBound = true;
    var closeIfOutside = function (e) {
      var target = e && e.target;
      if (!target) return;

      // When settings drawer is open, first outside click must only close it.
      if (document.body && document.body.classList.contains('settings--open')) {
        if (!(target.closest && target.closest('.settings'))) {
          try {
            if (window.Lampa && Lampa.Controller && typeof Lampa.Controller.back === 'function') {
              Lampa.Controller.back();
            }
          } catch (err) { }
          markSwallowClick(280);
          consumeEvent(e);
          return;
        }
      }

      if (!controlPanelOpen) return;
      if (target.closest && target.closest('.agnative-control-panel')) return;
      if (target.closest && target.closest('.agnative-topnav-shell__clock')) return;
      closeControlPanel(true);
      markSwallowClick(280);
      consumeEvent(e);
    };

    var swallowClick = function (e) {
      if (Date.now() >= swallowClickUntil) return;
      consumeEvent(e);
    };

    document.addEventListener('mousedown', closeIfOutside, true);
    document.addEventListener('touchstart', closeIfOutside, true);
    document.addEventListener('click', swallowClick, true);
  }

  function ensureControlPanelController(panel) {
    if (controlPanelControllerReady || !window.Lampa || !Lampa.Controller || !Lampa.Controller.add || !window.$) return;
    controlPanelControllerReady = true;

    Lampa.Controller.add('agnative_control_panel', {
      toggle: function () {
        var view = $(panel);
        var target = qs('.agnative-control-panel__tile.selected', panel) || qs('.agnative-control-panel__tile.selector', panel);
        Lampa.Controller.collectionSet(view);
        Lampa.Controller.collectionFocus(target || false, view, true);
      },
      up: function () { if (window.Navigator && Navigator.move) Navigator.move('up'); },
      down: function () { if (window.Navigator && Navigator.move) Navigator.move('down'); },
      left: function () { if (window.Navigator && Navigator.move) Navigator.move('left'); },
      right: function () { if (window.Navigator && Navigator.move) Navigator.move('right'); },
      back: function () { closeControlPanel(true); }
    });
  }

  function ensureControlPanel(head) {
    if (!head) return null;
    var panel = qs('.agnative-control-panel', head);
    if (!panel) {
      panel = document.createElement('div');
      panel.className = 'agnative-control-panel';
      panel.setAttribute('aria-hidden', 'true');
      head.appendChild(panel);
    }

    panel.innerHTML = '<div class="agnative-control-panel__title">' + escapeHtml(langText('settings_cub_account', 'Account')) + '</div><div class="agnative-control-panel__grid"></div>';
    var grid = qs('.agnative-control-panel__grid', panel);
    if (!grid) return panel;

    [
      { role: 'settings', title: langText('title_settings', 'Settings'), icon: iconSettings(), handler: triggerSettings },
      { role: 'sync', title: langText('settings_cub_sync', 'Synchronization'), icon: iconSync(), handler: triggerSyncSettings },
      { role: 'player', title: langText('settings_main_player', 'Player'), icon: iconPlayer(), handler: triggerPlayerSettings },
      { role: 'data', title: langText('settings_rest_cache_all', 'Cache & Data'), icon: iconData(), handler: triggerCacheDataSettings }
    ].forEach(function (def) {
      var tile = document.createElement('div');
      tile.className = 'agnative-control-panel__tile selector';
      tile.setAttribute('data-role', def.role);
      tile.setAttribute('data-selector', 'true');
      tile.setAttribute('tabindex', '0');
      tile.innerHTML = '<span class="agnative-control-panel__icon">' + def.icon + '</span><span class="agnative-control-panel__label">' + escapeHtml(def.title) + '</span>';
      bindAction(tile, function () {
        closeControlPanel(true);
        def.handler();
      });
      grid.appendChild(tile);
    });

    ensureControlPanelController(panel);
    bindControlPanelOutsideClose();
    return panel;
  }

  function openControlPanel(head) {
    var panel = ensureControlPanel(head || qs('.head__body') || qs('.head'));
    if (!panel) return false;
    if (controlPanelOpen) return true;

    controlPanelOpen = true;
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');

    try {
      if (window.Lampa && Lampa.Controller && typeof Lampa.Controller.enabled === 'function') {
        var current = Lampa.Controller.enabled();
        controlPanelPrevController = current && current.name ? current.name : '';
      }
      if (window.Lampa && Lampa.Controller && typeof Lampa.Controller.toggle === 'function') {
        Lampa.Controller.toggle('agnative_control_panel');
      }
    } catch (e) { }
    return true;
  }

  function closeControlPanel(restoreController) {
    var panel = qs('.agnative-control-panel');
    if (!panel || !controlPanelOpen) return false;

    controlPanelOpen = false;
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');

    try {
      if (restoreController && controlPanelPrevController && window.Lampa && Lampa.Controller && typeof Lampa.Controller.toggle === 'function') {
        Lampa.Controller.toggle(controlPanelPrevController);
      }
    } catch (e) { }

    return true;
  }

  function triggerClockActions(head) {
    if (controlPanelOpen) return closeControlPanel(true);
    return openControlPanel(head);
  }

  function bindAction(btn, fn) {
    if (!btn || !fn) return;
    var busy = false;
    function run(e) {
      if (busy) return false;
      busy = true;
      setTimeout(function () { busy = false; }, 180);
      if (e && e.preventDefault) e.preventDefault();
      if (e && e.stopPropagation) e.stopPropagation();
      fn();
      return false;
    }
    btn.addEventListener('click', run);
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') run(e);
    });
    btn.addEventListener('mouseenter', function () { btn.classList.add('hover'); });
    btn.addEventListener('mouseleave', function () { btn.classList.remove('hover'); });
    if (window.$) {
      try {
        $(btn).off('.agnativeTopnavAction');
        $(btn).on('hover:enter.agnativeTopnavAction', run);
        $(btn).on('hover:focus.agnativeTopnavAction hover:hover.agnativeTopnavAction', function () {
          btn.classList.add('focus');
        });
        $(btn).on('hover:blur.agnativeTopnavAction hover:out.agnativeTopnavAction', function () {
          btn.classList.remove('focus');
        });
      } catch (e) { }
    }
  }

  function bindMenu(btn, actionName, sourceNode) {
    if (!btn) return;
    var busy = false;
    function run(e) {
      if (busy) return false;
      busy = true;
      setTimeout(function () { busy = false; }, 180);
      if (e && e.preventDefault) e.preventDefault();
      if (e && e.stopPropagation) e.stopPropagation();
      if (sourceNode && triggerSelectorEnter(sourceNode)) return false;
      if (actionName && triggerMenuAction(actionName)) return false;
      return false;
    }
    btn.addEventListener('click', run);
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') run(e);
    });
    btn.addEventListener('mouseenter', function () { btn.classList.add('hover'); });
    btn.addEventListener('mouseleave', function () { btn.classList.remove('hover'); });
    if (window.$) {
      try {
        $(btn).off('.agnativeTopnavMenu');
        $(btn).on('hover:enter.agnativeTopnavMenu', run);
        $(btn).on('hover:focus.agnativeTopnavMenu hover:hover.agnativeTopnavMenu', function () {
          btn.classList.add('focus');
        });
        $(btn).on('hover:blur.agnativeTopnavMenu hover:out.agnativeTopnavMenu', function () {
          btn.classList.remove('focus');
        });
      } catch (e) { }
    }
  }

  function syncTopnavWithHeadController(head) {
    if (!head || !window.Lampa || !Lampa.Controller || !window.$) return;
    if (typeof Lampa.Controller.enabled !== 'function' || typeof Lampa.Controller.collectionSet !== 'function') return;

    try {
      var enabled = Lampa.Controller.enabled();
      if (!enabled || enabled.name !== 'head') return;

      var view = $(head);
      var target = qs('.agnative-topnav-shell__item.focus', head) ||
        qs('.agnative-topnav-shell__item.is-active', head) ||
        qs('.agnative-topnav-shell__item.selector', head);

      Lampa.Controller.collectionSet(view, false, true);
      if (typeof Lampa.Controller.collectionFocus === 'function') {
        Lampa.Controller.collectionFocus(target || false, view, true);
      }
    } catch (e) { }
  }

  function updateClock() {
    var clocks = qsa('.agnative-topnav-shell__clock-time, .agnative-topnav-right__clock-time');
    if (!clocks.length) return;
    var d = new Date();
    var value = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    clocks.forEach(function (clock) {
      clock.textContent = value;
    });
  }

  function startClock() {
    updateClock();
    if (clockTimer) return;
    clockTimer = setInterval(updateClock, 1000 * 20);
  }

  function patchTopnav() {
    var head = qs('.head__body') || qs('.head');
    if (!head) return false;

    closeControlPanel(false);
    var legacyClock = document.getElementById(CLOCK_ID);
    if (legacyClock) legacyClock.remove();

    startClock();

    var shell = qs('.agnative-topnav-shell', head);
    if (!shell) {
      shell = document.createElement('div');
      shell.className = 'agnative-topnav-shell';
      shell.innerHTML = '<div class="agnative-topnav-shell__inner"><div class="agnative-topnav-shell__items"></div></div>';
      head.appendChild(shell);
    }

    var itemsWrap = qs('.agnative-topnav-shell__items', shell);
    if (!itemsWrap) return false;

    var rightWrap = qs('.agnative-topnav-right', shell);
    if (!rightWrap) {
      rightWrap = document.createElement('div');
      rightWrap.className = 'agnative-topnav-right';
      shell.appendChild(rightWrap);
    }

    itemsWrap.innerHTML = '';
    rightWrap.innerHTML = '';

    getSelectedTopnavItems().forEach(function (def) {
      var sourceNode = getMenuItem(def.action);
      var btn = document.createElement('div');
      btn.className = 'agnative-topnav-shell__item selector';
      btn.setAttribute('data-action', def.action);
      btn.setAttribute('data-selector', 'true');
      btn.setAttribute('tabindex', '0');
      btn.textContent = def.label;
      bindMenu(btn, def.action, sourceNode);
      itemsWrap.appendChild(btn);
    });

    [
      { role: 'search', svg: iconSearch(), handler: triggerSearch },
      { role: 'favorite', svg: iconFavorite(), handler: triggerFavorite }
    ].forEach(function (def) {
      var btn = document.createElement('div');
      btn.className = 'agnative-topnav-shell__item agnative-topnav-shell__item--icon selector';
      btn.setAttribute('data-role', def.role);
      btn.setAttribute('data-selector', 'true');
      btn.setAttribute('tabindex', '0');
      btn.innerHTML = def.svg;
      bindAction(btn, def.handler);
      itemsWrap.appendChild(btn);
    });

    var clockBtn = document.createElement('div');
    clockBtn.className = 'agnative-topnav-shell__item agnative-topnav-shell__clock agnative-topnav-right__clock selector';
    clockBtn.setAttribute('data-role', 'control');
    clockBtn.setAttribute('data-selector', 'true');
    clockBtn.setAttribute('tabindex', '0');
    clockBtn.innerHTML = '<span class="agnative-topnav-right__clock-time"></span>';
    bindAction(clockBtn, function () { triggerClockActions(head); });
    rightWrap.appendChild(clockBtn);

    var profileBtn = document.createElement('div');
    profileBtn.className = 'agnative-topnav-shell__item agnative-topnav-right__profile selector';
    profileBtn.setAttribute('data-role', 'profile');
    profileBtn.setAttribute('data-selector', 'true');
    profileBtn.setAttribute('tabindex', '0');
    profileBtn.innerHTML = getProfileButtonHtml();
    bindAction(profileBtn, triggerProfile);
    rightWrap.appendChild(profileBtn);

    updateClock();

    syncTopnavWithHeadController(head);

    qsa('.agnative-topnav-shell__item[data-action]', shell).forEach(function (btn) {
      btn.classList.remove('is-active');
      var source = getMenuItem(btn.getAttribute('data-action'));
      if (source && (source.classList.contains('active') || source.classList.contains('focus') || source.classList.contains('hover'))) {
        btn.classList.add('is-active');
      }
    });

    return true;
  }

  function fetchLogo(id, type, callback) {
    if (!id) return callback(null);
    var cacheKey = type + '/' + id + '/' + getLogoLang();

    if (cacheKey in logoCache) return callback(logoCache[cacheKey]);

    if (logoPending[cacheKey]) {
      logoPending[cacheKey].push(callback);
      return;
    }

    logoPending[cacheKey] = [callback];

    var logoLang = getLogoLang();
    var preferredLanguages = [logoLang];
    if (logoLang !== 'en') preferredLanguages.push('en');

    var includeImageLanguage = preferredLanguages.concat(['null']).join(',');

    var url = 'https://api.themoviedb.org/3/' + type + '/' + id +
      '/images?api_key=' + TMDB_KEY + '&include_image_language=' + includeImageLanguage;

    fetch(url).then(function (r) { return r.json(); }).then(function (data) {
      var logo = null;
      if (data.logos && data.logos.length) {
        var picked = null;
        preferredLanguages.some(function (lang) {
          picked = data.logos.find(function (l) { return l.iso_639_1 === lang; }) || null;
          return !!picked;
        });
        if (!picked) picked = data.logos.find(function (l) { return l.iso_639_1 === null || typeof l.iso_639_1 === 'undefined'; }) || data.logos[0];
        if (picked && picked.file_path) {
          logo = {
            path: picked.file_path,
            width: picked.width,
            height: picked.height
          };
        }
      }
      logoCache[cacheKey] = logo;
      var cbs = logoPending[cacheKey] || [];
      delete logoPending[cacheKey];
      for (var i = 0; i < cbs.length; i++) cbs[i](logo);
    }).catch(function () {
      logoCache[cacheKey] = null;
      var cbs = logoPending[cacheKey] || [];
      delete logoPending[cacheKey];
      for (var i = 0; i < cbs.length; i++) cbs[i](null);
    });
  }

  function logoImgUrl(logoPath) {
    return Lampa.TMDB.image('t/p/w300' + logoPath);
  }

  function switchCardToBackdrop(cardEl) {
    if (cardEl.getAttribute('data-nfx-switched')) return;
    cardEl.setAttribute('data-nfx-switched', '1');

    // On mobile, keep poster images (portrait cards)
    if (isMobile()) return;

    var data = extractCardData(cardEl);
    if (!data) return;

    // Replace poster with backdrop image
    var imgEl = cardEl.querySelector('.card__img');
    if (imgEl && data.backdrop_path) {
      var backdropUrl = Lampa.TMDB.image('t/p/w500' + data.backdrop_path);
      if (imgEl.tagName === 'IMG') {
        imgEl.src = backdropUrl;
        imgEl.style.objectFit = 'cover';
        imgEl.style.objectPosition = 'center';
      } else {
        imgEl.style.backgroundImage = 'url(' + backdropUrl + ')';
        imgEl.style.backgroundSize = 'cover';
        imgEl.style.backgroundPosition = 'center';
      }
    }

    // Add title overlay on card
    var view = cardEl.querySelector('.card__view');
    if (!view || view.querySelector('.nfx-card-overlay')) return;

    var title = data.title || data.name || '';
    if (!title) {
      var titleEl = cardEl.querySelector('.card__title');
      if (titleEl) title = titleEl.textContent.trim();
    }

    var vote = data.vote_average ? parseFloat(data.vote_average) : 0;
    var year = '';
    if (data.release_date) year = data.release_date.substring(0, 4);
    else if (data.first_air_date) year = data.first_air_date.substring(0, 4);

    // Overlay with logo/title + meta
    var overlay = document.createElement('div');
    overlay.className = 'nfx-card-overlay';

    // Build meta line
    var metaParts = [];
    if (vote > 0) metaParts.push('<span class="nfx-card-overlay__match">' + Math.round(vote * 10) + '%</span>');
    if (year) metaParts.push('<span>' + year + '</span>');
    var genreNames = getGenreNames(data);
    if (genreNames.length) metaParts.push('<span>' + escapeHtml(genreNames.slice(0, 2).join(', ')) + '</span>');
    var metaHtml = metaParts.length ? '<div class="nfx-card-overlay__meta">' + metaParts.join('<span style="opacity:0.4"> · </span>') + '</div>' : '';

    // Start with text title, then try to replace with logo
    var titleHtml = title ? '<div class="nfx-card-overlay__title">' + escapeHtml(title) + '</div>' : '';
    overlay.innerHTML = titleHtml + metaHtml;
    view.appendChild(overlay);

    // Fetch logo asynchronously and replace text title if found
    var tmdbType = data.name ? 'tv' : 'movie';
    fetchLogo(data.id, tmdbType, function (logo) {
      if (!logo) return;
      var titleDiv = overlay.querySelector('.nfx-card-overlay__title');
      if (titleDiv) {
        var img = document.createElement('img');
        img.className = 'nfx-card-overlay__logo';
        img.src = logoImgUrl(logo.path);
        img.alt = title;
        img.loading = 'lazy';
        img.onerror = function () { img.style.display = 'none'; };
        titleDiv.replaceWith(img);
      }
    });

    if (shouldShowBadge()) {
      var badge = document.createElement('div');
      badge.className = 'nfx-card-logo';
      badge.textContent = data.name ? t('badge_tv') : t('badge_movie');
      view.appendChild(badge);
    }

    if (ratingEnabled() && vote > 0) {
      var rating = document.createElement('div');
      rating.className = 'nfx-card-rating';
      rating.textContent = vote.toFixed(1);
      view.appendChild(rating);
    }
  }

  function processCards(container) {
    if (!container) return;
    var cards = container.querySelectorAll('.card');
    for (var i = 0; i < cards.length; i++) switchCardToBackdrop(cards[i]);
  }

  function observeCards() {
    if (!window.MutationObserver) return;
    new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var added = mutations[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var node = added[j];
          if (node.nodeType !== 1) continue;
          if (node.classList && node.classList.contains('card')) {
            switchCardToBackdrop(node);
          } else if (node.querySelectorAll) {
            var cards = node.querySelectorAll('.card');
            for (var k = 0; k < cards.length; k++) switchCardToBackdrop(cards[k]);
          }
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  function initGlareRuntime() {
    if (window.__AGNATIVE_TOPNAV_GLARE_RUNTIME__) return;
    window.__AGNATIVE_TOPNAV_GLARE_RUNTIME__ = true;
    if (!document.body) return;

    document.body.addEventListener('mousemove', function (e) {
      if (!glareEnabled()) return;
      var card = e.target.closest('.card, .card-episode, .full-start-new__poster');
      if (!card) return;

      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var xPct = (x / rect.width) * 2 - 1;
      var yPct = (y / rect.height) * 2 - 1;

      card.style.setProperty('--gx', x + 'px');
      card.style.setProperty('--gy', y + 'px');
      card.style.setProperty('--rx', (yPct * -7) + 'deg');
      card.style.setProperty('--ry', (xPct * 7) + 'deg');
    });

    document.body.addEventListener('mouseleave', function (e) {
      var card = e.target.closest('.card, .card-episode, .full-start-new__poster');
      if (!card) return;
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--gx', '50%');
      card.style.setProperty('--gy', '50%');
    }, true);
  }

  function safePatch() {
    scheduled = false;
    if (!pluginEnabled()) {
      removePluginUi();
      return;
    }
    injectStyle();
    if (document.body) document.body.classList.add(BODY_CLASS);

    var content = qs('.activity--active .scroll__content') || qs('.scroll__content');
    patchTopnav();
    if (!content) return;
    processCards(content);
    setTimeout(function () { processCards(content); }, 400);
    setTimeout(function () { processCards(content); }, 1200);
  }

  function schedulePatch() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(safePatch, 120);
  }

  function startPlugin() {
    registerSettings();
    bindRuntimeListeners();
    if (!pluginEnabled()) {
      removePluginUi();
      return;
    }

    injectStyle();
    if (document.body) document.body.classList.add(BODY_CLASS);
    bindInputModeListeners();
    setInputMode('mouse');
    syncGlareClass();
    observeCards();
    initGlareRuntime();
    processCards(document.body);
    schedulePatch();
    setTimeout(function () { injectStyle(); }, 900);
    setTimeout(function () {
      var actBody = qs('.activity--active .activity__body') || qs('.activity__body');
      if (actBody) {
        processCards(actBody);
      }
    }, 600);
    setTimeout(function () { schedulePatch(); }, 420);
  }

  function bootPlugin() {
    registerSettings();
    startPlugin();
    setTimeout(function () { schedulePatch(); }, 350);
    requestPluginReinit(950);
  }

  if (window.appready) bootPlugin();
  else {
    try {
      Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') bootPlugin();
      });
    } catch (e) {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootPlugin);
      else bootPlugin();
    }
  }
})();
