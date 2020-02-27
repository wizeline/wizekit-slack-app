/* eslint-disable no-param-reassign, no-undef */

const END_POINT = '/api';

const kudosTable = Vue.component('kudosTable', {
  template: `
  <v-card>
    <v-card-title>
      Latest Kudos
      <v-spacer></v-spacer>
    </v-card-title>
    <v-data-table
        :headers="headers"
        :fixedHeader="true"
        :items="kudos"
        :sort-by="['createdAt']"
        :sort-desc="[true]"
        class="elevation-1 p-20"
        :loading="loading" loading-text="Loading... Please wait"
      >
        <template v-slot:item.realName="{ item }" class="display-name">
          <v-avatar>
            <img
              :src=item.image
              :alt=item.realName
            >
          </v-avatar>
          <strong>{{item.realName}}</strong>
        </template>
        <template v-slot:item.text="{ item }">
          <span v-for="t in item.textParsed" >
            <v-chip outlined color="primary" :to="'/dashboard/kudos/receiver/' + t.id" v-if="t.type === 'user'">
              <strong>{{t.text}}</strong>
            </v-chip>
            <span v-if="t.type === 'text'">{{t.text}}</span>
          </span>
        </template>
        <template v-slot:item.createdAt="{ item }">
          {{item.createdAt|formatDate}}
        </template>
    </v-data-table>
  </v-card>
  `,
  data() {
    return {
      kudos: [],
      originKudoList: [],
      headers: [
        {
          text: 'Giver',
          align: 'left',
          value: 'realName',
          width: '20%',
        },
        { text: 'Message', value: 'text', width: '50%' },
        { text: 'Created At', value: 'createdAt' },
        { text: 'Channel', value: 'channel_name' },
      ],
    };
  },
  mounted() {
    const fromDate = this.$store.getters.getFromDate;
    const toDate = this.$store.getters.getToDate;
    this.getKudosList(fromDate, toDate);
  },
  created() {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'SET_TO_DATE' || mutation.type === 'SET_FROM_DATE') {
        this.getKudosList(state.fromDate, state.toDate);
      }
    });
  },
  watch: {
    $route(to) {
      const matches = to.path.match(/\/dashboard\/kudos\/receiver\/(\S+)/);
      const receiver = matches ? matches[1] : null;
      if (receiver) {
        this.kudos = this.originKudoList.filter(
          (k) => (receiver
              && k.text
              && k.text.includes(receiver)
          ),
        );
      } else if (to.path === '/dashboard/kudos') {
        this.kudos = this.originKudoList;
      }
    },
  },
  computed: {
    currentGiver() {
      return this.$route.params.givername;
    },
    currentReceiver() {
      return this.$route.params.receivername;
    },
    loading() {
      return this.$store.getters.getIsFetching;
    },
  },
  methods: {
    formatText(text = '', usersMap) {
      if (!text) {
        return text;
      }
      const parsedText = [];
      const userRegex = /^(<@U[\w\d]+\|[\w.\d]+>)/;
      let start = 0;
      let range = 0;
      for (let i = 0; i < text.length; i += 1) {
        c = text.charAt(i);
        if (c === '<') {
          const subText = text.substr(i);
          const matches = subText.match(userRegex);
          if (matches) {
            const textSegment = text.substr(start, range);
            parsedText.push({
              type: 'text',
              text: textSegment,
            });

            const username = matches[0].split('|')[1].replace('>', '');
            const userProfile = usersMap[username];
            if (userProfile) {
              parsedText.push({
                type: 'user',
                text: userProfile.realName,
                id: username,
              });
              const matchLength = matches[0].length;
              i += matchLength;
            }
            start = i;
            range = 0;
          }
        }
        range += 1;
        if (i === (text.length - 1)) {
          const textSegment = text.substr(start, range);
          parsedText.push({
            type: 'text',
            text: textSegment,
          });
        }
      }
      return parsedText;
    },
    getKudosList(fromDate, toDate) {
      if (this.$store.getters.getIsFetching) {
        console.log('Ignored request - fromDate:', fromDate, ';toDate:', toDate);
        return;
      }
      if (!fromDate || !toDate || fromDate > toDate) {
        this.kudos = [];
        return;
      }
      this.$store.dispatch('setStartFetching');
      apiGetKudos(fromDate, toDate).then(({ data: kudosList }) => {
        getUsers().then((usersResponse) => {
          this.kudos = kudosList.map((k, index) => {
            const user = usersResponse[k.user_name];
            if (user) {
              k.id = index;
              k.name = user.name;
              k.tz = user.tz;
              k.realName = user.realName;
              k.image = user.image;
            }
            k.textParsed = this.formatText(k.text, usersResponse);
            return k;
          });

          this.originKudoList = [...this.kudos];

          if (this.currentGiver) {
            this.kudos = this.originKudoList.filter(
              (k) => this.currentGiver && this.currentGiver === k.name,
            );
          } else if (this.currentReceiver) {
            const usernamePart = `|${this.currentReceiver}>`;
            this.kudos = this.originKudoList.filter(
              (k) => k.text
                  && k.text.includes(usernamePart),
            );
          }
          this.$store.dispatch('setFinishedFetching');
        });
      });
    },
  },
});

const giverTable = Vue.component('giverTable', {
  template: `
  <v-card>
    <v-card-title>
      Top Givers
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        label="Search by name"
        clearable
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="givers"
      :fixed-header="true"
      :sort-by="['count']"
      :sort-desc="[true]"
      class="elevation-1"
      :loading="loading" loading-text="Loading... Please wait"
    >
      <template v-slot:item.realName="{ item }">
        <div>
        <v-avatar>
          <img
            :src=item.image
            :alt=item.realName
          >
        </v-avatar>
         <strong>{{item.realName}}</strong>
        </div>
      </template>
      <template v-slot:item.count="{ item }">
        <v-chip
          outlined
          color="primary"
          :to="'/dashboard/kudos/giver/'+item.username">{{item.count}}
        </v-chip>
      </template>
    </v-data-table>
  </v-card>
  `,
  data() {
    return {
      givers: [],
      originGivers: [],
      search: '',
      headers: [
        {
          text: 'Display Name',
          align: 'left',
          sortable: false,
          value: 'realName',
          width: '30%',
        },
        { text: 'Given', value: 'count', width: '10%' },
        { text: 'Time Zone', value: 'tz', width: '10%' },
        { text: '', value: '' },
      ],
    };
  },
  watch: {
    search(searchText) {
      // TODO: Use debounce to improve performance.
      if (searchText) {
        this.givers = this.originGivers
          .filter((u) => (u.realName && u.realName.toLowerCase().includes(searchText.toLowerCase()))
          || (u.name && u.name.toLowerCase().includes(searchText.toLowerCase())));
      } else {
        this.givers = [...this.originGivers];
      }
    },
  },
  mounted() {
    const fromDate = this.$store.getters.getFromDate;
    const toDate = this.$store.getters.getToDate;
    this.getLeaderBoardData(fromDate, toDate);
  },
  created() {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'SET_TO_DATE' || mutation.type === 'SET_FROM_DATE') {
        this.getLeaderBoardData(state.fromDate, state.toDate);
      }
    });
  },
  computed: {
    loading() {
      return this.$store.getters.getIsFetching;
    },
  },
  methods: {
    getLeaderBoardData(fromDate, toDate) {
      if (this.$store.getters.getIsFetching) {
        console.log('Ignored request - fromDate:', fromDate, ';toDate:', toDate);
        return;
      }
      if (!fromDate || !toDate || fromDate > toDate) {
        this.givers = [];
        return;
      }

      this.$store.dispatch('setStartFetching');
      apiGetLeaderBoard(fromDate, toDate).then(({ data }) => {
        const { giverCount } = data.summary;
        this.givers = Object.keys(giverCount).map((key) => {
          const giver = {};
          giver.username = key;
          giver.count = giverCount[key];
          return giver;
        });

        getUsers().then((usersResponse) => {
          this.givers = this.givers.map((r) => {
            const user = usersResponse[r.username];
            if (user) {
              r.id = user.id;
              r.name = user.name;
              r.tz = user.tz;
              r.realName = user.realName;
              r.image = user.image;
            }
            return r;
          });
          this.originGivers = [...this.givers];
          this.$store.dispatch('setFinishedFetching');
        });
      });
    },
  },
});

const receiverTable = Vue.component('receiverTable', {
  template: `
  <v-card>
    <v-card-title>
      Top Receivers
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        label="Search by name"
        clearable
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="receivers"
      :fixed-header="true"
      :sort-by="['count']"
      :sort-desc="[true]"
      class="elevation-1"
      :loading="loading" loading-text="Loading... Please wait"
    >
      <template v-slot:item.realName="{ item }">
        <div>
        <v-avatar>
          <img
            :src=item.image
            :alt=item.realName
          >
        </v-avatar>
         <strong>{{item.realName}}</strong>
        </div>
      </template>
      <template v-slot:item.count="{ item }">
        <v-chip
          outlined
          color="primary"
          :to="'/dashboard/kudos/receiver/'+item.username">{{item.count}}
        </v-chip>
      </template>
    </v-data-table>
  </v-card>
  `,
  data() {
    return {
      receivers: [],
      originReceivers: [],
      search: '',
      headers: [
        {
          text: 'Display Name',
          align: 'left',
          sortable: false,
          value: 'realName',
          width: '30%',
        },
        { text: 'Received', value: 'count', width: '10%' },
        { text: 'Time Zone', value: 'tz', width: '20%' },
        {
          text: '', value: '', align: 'left', sortable: false,
        },
      ],
    };
  },
  watch: {
    search(searchText) {
      // TODO: Use debounce to improve performance.
      if (searchText) {
        this.receivers = this.originReceivers
          .filter((u) => (u.realName && u.realName.toLowerCase().includes(searchText.toLowerCase()))
          || (u.name && u.name.toLowerCase().includes(searchText.toLowerCase())));
      } else {
        this.receivers = [...this.originReceivers];
      }
    },
  },
  computed: {
    loading() {
      return this.$store.getters.getIsFetching;
    },
  },
  mounted() {
    const fromDate = this.$store.getters.getFromDate;
    const toDate = this.$store.getters.getToDate;
    this.getLeaderBoardData(fromDate, toDate);
  },
  created() {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'SET_TO_DATE' || mutation.type === 'SET_FROM_DATE') {
        this.getLeaderBoardData(state.fromDate, state.toDate);
      }
    });
  },
  methods: {
    getLeaderBoardData(fromDate, toDate) {
      if (this.$store.getters.getIsFetching) {
        console.log('Ignored request - fromDate:', fromDate, ';toDate:', toDate);
        return;
      }
      if (!fromDate || !toDate || fromDate > toDate) {
        this.receivers = [];
        return;
      }
      this.$store.dispatch('setStartFetching');
      apiGetLeaderBoard(fromDate, toDate).then(({ data }) => {
        const { receiverCount } = data.summary;
        this.receivers = Object.keys(receiverCount).map((key) => {
          const giver = {};
          giver.username = key;
          giver.count = receiverCount[key];
          return giver;
        });

        getUsers().then((usersResponse) => {
          this.receivers = this.receivers.map((r) => {
            const tempR = { ...r };
            const user = usersResponse[tempR.username];
            if (user) {
              tempR.id = user.id;
              tempR.name = user.name;
              tempR.tz = user.tz;
              tempR.realName = user.realName;
              tempR.image = user.image;
            }
            return tempR;
          });
          this.originReceivers = [...this.receivers];
          this.$store.dispatch('setFinishedFetching');
        });
      });
    },
  },
});

const store = new Vuex.Store({
  state: {
    isFetching: false,
    fromDate: null,
    toDate: null,
    userProfile: {
      displayName: 'Wizeline',
      photoURL: 'https://itviec.com/employers/wizeline/logo/w170/eAitKXUaV26RmxaT7V8mwxev/wizeline-logo.png',
    },
  },
  getters: {
    getIsFetching: (state) => state.isFetching,
    getFromDate: (state) => state.fromDate,
    getToDate: (state) => state.toDate,
    getUserProfile: (state) => state.userProfile,
  },
  mutations: {
    SET_START_FETCHING(state) {
      state.isFetching = true;
    },
    SET_FINISHED_FETCHING(state) {
      state.isFetching = false;
    },
    SET_FROM_DATE(state, fromDate) {
      state.fromDate = fromDate;
    },
    SET_TO_DATE(state, toDate) {
      state.toDate = toDate;
    },
    SET_FROM_DATE_TO_DATE(state, bothDate) {
      state.toDate = bothDate.endDate;
      state.fromDate = bothDate.startDate;
    },
    SET_USER_PROFILE(state, userProfile) {
      state.userProfile = userProfile;
    },
  },
  actions: {
    setStartFetching({ commit }) {
      commit('SET_START_FETCHING');
    },
    setFinishedFetching({ commit }) {
      commit('SET_FINISHED_FETCHING');
    },
    setBothDate({ commit }, bothDate) {
      commit('SET_FROM_DATE_TO_DATE', bothDate);
    },
    setFromDate({ commit }, fromDate) {
      commit('SET_FROM_DATE', fromDate);
    },
    setToDate({ commit }, toDate) {
      commit('SET_TO_DATE', toDate);
    },
    setUserProfile({ commit }, userProfile) {
      commit('SET_USER_PROFILE', userProfile);
    },
  },
});

Vue.filter('formatDate', (value) => {
  if (value) {
    return new Intl.DateTimeFormat('en-US', {
      timeStyle: 'medium',
      dateStyle: 'medium',
    }).format(new Date(value));
  }
  return '';
});

const dashboardPage = Vue.component('dashboard', {
  data() {
    return {
      selectedFilter: '',
      isAuthenticated: false,
      drawer: true,
      fromDateMenu: false,
      toDateMenu: false,
      menuVisible: false,
      fromDate: getLastMonthFirstDate(),
      toDate: getToday(),
      items: [
        {
          title: 'Leaderboard',
          icon: 'mdi-view-dashboard',
          link: '/dashboard/',
        },
        {
          title: 'Giver',
          icon: 'mdi-send',
          link: '/dashboard/giver',
        },
        {
          title: 'Kudos',
          icon: 'mdi-message-text',
          link: '/dashboard/kudos',
        },
      ],
    };
  },
  computed: {
    isLoading() {
      return this.$store.getters.getIsLoading;
    },
    getFromDateString() {
      return new Date(this.fromDate).toISOString().substr(0, 10);
    },
    getToDateString() {
      return new Date(this.toDate).toISOString().substr(0, 10);
    },
    getUserProfile() {
      return this.$store.getters.getUserProfile;
    },
  },
  watch: {
    fromDate(newVal, oldVal) {
      if (newVal && oldVal && newVal === oldVal) {
        return;
      }
      this.$store.dispatch('setFromDate', newVal);
    },
    toDate(newVal, oldVal) {
      if (newVal && oldVal && newVal === oldVal) {
        return;
      }
      this.$store.dispatch('setToDate', newVal);
    },
  },
  methods: {
    thisMonthClick() {
      if (this.selectedFilter === 'this-month') {
        return;
      }
      this.selectedFilter = 'this-month';
      const thisMonth = getThisMonth();
      this.$store.dispatch('setBothDate', thisMonth);
    },
    lastMonthClick() {
      if (this.selectedFilter === 'last-month') {
        return;
      }
      this.selectedFilter = 'last-month';
      const lastMonth = getLastMonth();
      this.$store.dispatch('setBothDate', lastMonth);
    },
    thisYearClick() {
      if (this.selectedFilter === 'this-year') {
        return;
      }
      this.selectedFilter = 'this-year';
      const thisYear = getThisYear();
      this.$store.dispatch('setBothDate', thisYear);
    },
    lastYearClick() {
      if (this.selectedFilter === 'last-year') {
        return;
      }
      this.selectedFilter = 'last-year';
      const lastYear = getLastYear();
      this.$store.dispatch('setBothDate', lastYear);
    },
    parseDate(date) {
      if (!date) return null;
      return new Date(date).toISOString().substr(0, 10);
    },
    onLogoutClick() {
      const me = this;
      firebase.auth().signOut().then(() => {
        window.localStorage.clear();
        me.$router.push('/login');
      }).catch((error) => {
        console.log('error:', error);
        window.localStorage.clear();
      });
    },
  },
  created() {
    this.$store.dispatch('setFromDate', this.fromDate);
    this.$store.dispatch('setToDate', this.toDate);
    const userProfile = localStoreCacheGet('userProfile');
    if (userProfile) {
      this.$store.dispatch('setUserProfile', userProfile);
    }
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'SET_TO_DATE' || mutation.type === 'SET_FROM_DATE' || mutation.type === 'SET_FROM_DATE_TO_DATE') {
        this.fromDate = state.fromDate;
        this.toDate = state.toDate;
      }
    });
  },
  template: `
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      color="primary"
      dark
      app
    >
      <v-list
        dense
        nav
        class="py-0"
      >
        <v-list-item two-line :class="miniVariant && 'px-0'">
          <v-list-item-avatar>
            <img :src="getUserProfile.photoURL">
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title>{{getUserProfile.displayName}}</v-list-item-title>
            <v-list-item-subtitle></v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-divider></v-divider>

        <v-list-item
          v-for="item in items"
          :key="item.title"
          link
          :to=item.link
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      color="deep-purple accent-4"
      elevate-on-scroll
      dark
      app >
      <v-app-bar-nav-icon class="hidden-sm-and-up" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Kudos Me</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon title="Logout" @click="onLogoutClick">
        <v-icon>mdi-export</v-icon>
      </v-btn>
    </v-app-bar>
    <v-content>
      <v-container fluid>
      <v-row>
        <v-col cols="12" lg="3">
          <v-menu
            v-model="fromDateMenu"
            :close-on-content-click="false"
            max-width="290"
          >
            <template v-slot:activator="{ on }">
              <v-text-field
                :value="getFromDateString"
                label="From Date: "
                readonly
                v-on="on"
                @click:clear="fromDate = null"
                @blur="fromDate = parseDate(getFromDateString)"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="fromDate"
              :max="toDate"
              @change="fromDateMenu = false"
            ></v-date-picker>
          </v-menu>
        </v-col>
        <v-col cols="12" lg="3">
          <v-menu
            v-model="toDateMenu"
            :close-on-content-click="false"
            max-width="290"
          >
            <template v-slot:activator="{ on }">
              <v-text-field
                :value="getToDateString"
                label="To Date: "
                readonly
                v-on="on"
                @click:clear="toDate = null"
                @blur="toDate = parseDate(getToDateString)"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="toDate"
              :min="fromDate"
              @change="toDateMenu = false"
            ></v-date-picker>
          </v-menu>
        </v-col>
        </v-row>
        <v-row justify="start" align="center">
          <v-chip
            class="ma-2"
            @click="thisMonthClick"
            :input-value="selectedFilter === 'this-month'"
            filter
          >
          This Month
          </v-chip>

          <v-chip
            class="ma-2"
            @click="lastMonthClick"
            :input-value="selectedFilter === 'last-month'"
            filter
          >
          Last Month
          </v-chip>

          <v-chip
            class="ma-2"
            @click="thisYearClick"
            :input-value="selectedFilter === 'this-year'"
            filter
          >
          This Year
          </v-chip>
          <v-chip
              class="ma-2"
              @click="lastYearClick"
              :input-value="selectedFilter === 'last-year'"
              filter
            >
          Last Year
          </v-chip>
      </v-row>
        <router-view></router-view>
      </v-container>
    </v-content>
    <v-footer app>
      <v-spacer></v-spacer>
      <div>
        <a target="_blank" href="https://github.com/wizeline/kudos-me/issues" >Share your feedback here!</a>
      </div>
    </v-footer>
  </v-app>
  `,
});

const homePage = Vue.component('HomePage', {
  template: `
  <v-app id="home">
      <v-content>
        <transition mode="out-in">
           <router-view></router-view>
        </transition>
     </v-content>
   </v-app>
  `,
  mounted() {
    const idToken = localStoreCacheGet('idToken', true);
    if (idToken && idToken.length) {
      if (this.$route.path !== '/dashboard') {
        this.$router.push('/dashboard');
      }
    }
  },
});

const loginPage = Vue.component('LoginPage', {
  template: `
  <v-container
      fluid
      fill-height
    >
      <v-layout
        align-center
        justify-center
        id="firebaseui-auth-container"
      >
      </v-layout>
    </v-container>
  `,
  mounted() {
    const me = this;
    const uiConfig = {
      callbacks: {
        signInSuccessWithAuthResult({ user }) {
          me.$store.dispatch('setUserProfile', user);
          localStoreCachePut('userProfile', user);
          firebase.auth()
            .currentUser.getIdToken()
            .then((idToken) => {
              localStoreCachePut('idToken', idToken, true);
              me.$router.push('/dashboard');
            }).catch((error) => {
              console.log('getIdToken error:', error);
              me.$router.push('/login');
            });
          return true;
        },
        signInFailure(error) {
          console.log('signInFailure:', error);
          window.location.href = '/';
        },
      },
      signInSuccessUrl: '/',
      signInOptions: [
        {
          provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          customParameters: {
            prompt: 'select_account',
            hd: 'wizeline.com',
          },
        },
      ],
      signInFlow: 'popup',
      tosUrl: '/',
      privacyPolicyUrl() {
        window.location.assign('/');
      },
    };
    const ui = new firebaseui.auth.AuthUI(firebase.auth());
    ui.start('#firebaseui-auth-container', uiConfig);
  },
});

const router = new VueRouter({
  routes: [
    {
      path: '/',
      component: homePage,
      children: [
        {
          path: '/login',
          component: loginPage,
        },
      ],
    },
    {
      path: '/dashboard',
      component: dashboardPage,
      children: [
        { path: '/', component: receiverTable },
        { path: 'receiver', component: receiverTable },
        { path: 'giver', component: giverTable },
        { path: 'kudos', component: kudosTable },
        { path: 'kudos/giver/:givername', component: kudosTable },
        { path: 'kudos/receiver/:receivername', component: kudosTable },
        { path: '*', redirect: '/' },
      ],
    },
    {
      path: '/*',
      component: loginPage,
    },
  ],
});

new Vue({
  router,
  store,
  vuetify: new Vuetify(),
  template: `
    <main>
      <transition mode="out-in">
        <router-view></router-view>
      </transition>
    </main>
   `,
  mounted() {
    if (!this.getIsAuthenticated()) {
      const path = '/login';
      if (this.$route.path !== path) {
        this.$router.push(path);
      }
    }
  },
  methods: {
    getIsAuthenticated() {
      const idToken = localStoreCacheGet('idToken', true);
      return idToken && idToken.length;
    },
  },
  beforeRouteUpdate(to, from, next) {
    if (this.getIsAuthenticated()) {
      next();
    } else {
      next('/login');
    }
  },
}).$mount('#app');

function apiGetLeaderBoard(fromDate, toDate) {
  return fetchWapper(
    `${END_POINT}/kudos/leaderboard?fromDate=${fromDate}&toDate=${toDate}`,
  ).then((res) => res);
}

function apiGetKudos(fromDate, toDate) {
  return fetchWapper(
    `${END_POINT}/commands/kudos?fromDate=${fromDate}&toDate=${toDate}`,
  ).then((res) => res);
}

function getUsers() {
  const cacheKey = 'users-key';
  const cachedUsers = cacheGet(cacheKey);
  if (cachedUsers) {
    return Promise.resolve(cachedUsers);
  }

  return fetchWapper(`${END_POINT}/users/`)
    .then(({ data }) => {
      const cacheData = data.members.reduce((acc, member) => {
        acc[member.name] = {
          ...member,
        };
        return acc;
      }, {});
      cachePut(cacheKey, cacheData);
      return cacheData;
    });
}

function fetchWapper(url) {
  const accessToken = localStoreCacheGet('idToken', true);
  return fetch(
    url,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )
    .then(errorHandling)
    .then((res) => res.json());
}

function errorHandling(response) {
  if (response.status === 401) {
    localStorage.removeItem('idToken');
    window.location.href = '/#/login';
    return response;
  }
  return response;
}

function getThisMonth() {
  const startDate = new Date();
  startDate.setDate(1);
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(0);
  return {
    startDate: startDate.toISOString().substr(0, 10),
    endDate: endDate.toISOString().substr(0, 10),
  };
}

function getLastMonth() {
  const startDate = new Date();
  let year = startDate.getFullYear();
  let lastMonth = startDate.getMonth();
  if (startDate.getMonth() === 0) {
    lastMonth = 11;
    year = startDate.getFullYear() - 1;
  } else {
    lastMonth -= 1;
  }
  startDate.setFullYear(year);
  startDate.setMonth(lastMonth);
  startDate.setDate(1);
  const endDate = new Date();
  endDate.setDate(0);
  return {
    startDate: startDate.toISOString().substr(0, 10),
    endDate: endDate.toISOString().substr(0, 10),
  };
}

function getLastYear() {
  const startDate = new Date();
  const year = startDate.getFullYear();
  startDate.setFullYear(year - 1);
  startDate.setMonth(0);
  startDate.setDate(1);
  const endDate = new Date();
  endDate.setFullYear(year - 1);
  endDate.setMonth(11);
  endDate.setDate(31);
  return {
    startDate: startDate.toISOString().substr(0, 10),
    endDate: endDate.toISOString().substr(0, 10),
  };
}

function getThisYear() {
  const startDate = new Date();
  startDate.setMonth(0);
  startDate.setDate(1);
  const endDate = new Date();
  endDate.setMonth(11);
  endDate.setDate(31);
  return {
    startDate: startDate.toISOString().substr(0, 10),
    endDate: endDate.toISOString().substr(0, 10),
  };
}

function getLastMonthFirstDate() {
  const now = new Date();
  let year = now.getFullYear();
  let lastMonth = now.getMonth();
  if (now.getMonth() === 0) {
    lastMonth = 11;
    year = now.getFullYear() - 1;
  } else {
    lastMonth -= 1;
  }
  now.setFullYear(year);
  now.setMonth(lastMonth);
  now.setDate(1);
  return now.toISOString().substr(0, 10);
}

function getToday() {
  const now = new Date();
  return now
    .toISOString()
    .substr(0, 10);
}

function cachePut(key, object) {
  window.sessionStorage.setItem(key, JSON.stringify(object));
}

function cacheGet(key) {
  const cached = window.sessionStorage.getItem(key);
  return cached ? JSON.parse(cached) : cached;
}

function localStoreCacheGet(key, isString = false) {
  const cached = window.localStorage.getItem(key);
  if (isString) {
    return cached;
  }
  return cached ? JSON.parse(cached) : cached;
}

function localStoreCachePut(key, object, isString = false) {
  if (isString) {
    return window.localStorage.setItem(key, object);
  }
  return window.localStorage.setItem(key, JSON.stringify(object));
}
