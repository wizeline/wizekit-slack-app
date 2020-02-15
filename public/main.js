const END_POINT = '/api';

const kudosTable = Vue.component('kudosTable', {
  template: `
  <div class="md-layout md-gutter">
    <div class="md-layout-item md-small-size-100">
      <md-table v-model="kudos" md-sort="createdAt" md-sort-order="desc" md-card md-fixed-header>
        <md-table-row slot="md-table-row" slot-scope="{ item }">
          <md-table-cell md-label="Giver" md-sort-by="realName">
            <md-avatar>
              <img :src="item.image" alt="Avatar">
            </md-avatar>
            &nbsp; {{ item.realName }}
          </md-table-cell>
          <md-table-cell md-label="Message" md-sort-by="text" width="400px">{{ item.text }}</md-table-cell>
          <md-table-cell md-label="Created At" md-sort-by="createdAt">{{ item.createdAt|formatDate }}</md-table-cell>
          <md-table-cell md-label="Channel" md-sort-by="channel_name">{{ item.channel_name }}</md-table-cell>
        </md-table-row>
      </md-table>
    </div>
  </div>
  `,
  data: function() {
    return {
      kudos: [],
    };
  },
  mounted(){
    const fromDate = this.$store.getters.getFromDate;
    const toDate = this.$store.getters.getToDate;
    this.getKudosList(fromDate, toDate);
  },
  created() {
    this.$store.subscribe((mutation, state)=>{
      if(mutation.type == 'SET_TO_DATE' ||  mutation.type == 'SET_FROM_DATE'){
        this.getKudosList(state.fromDate, state.toDate);
      }
    })
  },
  methods: {
    getKudosList(fromDate, toDate) {
      if (!fromDate || !toDate || fromDate.getTime() > toDate.getTime()) {
        this.kudos = [];
        return;
      }
      this.showLoading();
      apiGetKudos(fromDate, toDate).then(({ data: kudosList }) => {
        getUsers().then(usersResponse => {
          this.hideLoading();
          this.kudos = kudosList.map((k, index) => {
            const user = usersResponse[k.user_name];
            if (user) {
              k.id = index;
              k.name = user.name;
              k.tz = user.tz;
              k.realName = user.realName;
              k.image = user.image;
            }
            return k;
          });
        });
      });
    },
    showLoading(){
      return this.$store.dispatch('showLoading');
    },
    hideLoading(){
      return this.$store.dispatch('hideLoading');
    }
  },
});

const giverTable = Vue.component('giverTable', {
  template: `
    <div class="md-layout md-gutter">
      <div class="md-layout-item md-size-100 md-small-size-100">
        <md-table v-model="givers" md-sort="count" md-sort-order="desc" md-card md-fixed-header>
          <md-table-row slot="md-table-row" slot-scope="{ item }">
            <md-table-cell md-label="Display Name" md-sort-by="realName" :title=item.username >
              <md-avatar>
                <img :src="item.image" alt="Avatar">
              </md-avatar>
              &nbsp; {{ item.realName }}
            </md-table-cell>
            <md-table-cell md-label="Count" md-sort-by="count" md-numeric>{{ item.count }}</md-table-cell>
            <md-table-cell md-label="Time Zone" md-sort-by="tz" md-numeric>{{ item.tz }}</md-table-cell>
          </md-table-row>
        </md-table>
      </div>
    </div>
  `,
  data: function() {
    return {
      givers: []
    };
  },
  mounted(){
    const fromDate = this.$store.getters.getFromDate;
    const toDate = this.$store.getters.getToDate;
    this.getLeaderBoardData(fromDate, toDate);
  },
  created() {
    this.$store.subscribe((mutation, state)=>{
      if(mutation.type == 'SET_TO_DATE' ||  mutation.type == 'SET_FROM_DATE'){
        this.getLeaderBoardData(state.fromDate, state.toDate);
      }
    })
  },
  methods: {
    getLeaderBoardData(fromDate, toDate) {
      if (!fromDate || !toDate || fromDate.getTime() > toDate.getTime()) {
        this.givers = [];
        return;
      }

      this.showLoading();
      apiGetLeaderBoard(fromDate, toDate).then(({ data }) => {
        const giverCount = data.summary.giverCount;
        const givers = Object.keys(giverCount).map(key => {
          let giver = {};
          giver.username = key;
          giver.count = giverCount[key];
          return giver;
        });

        this.givers = givers.sort((g1, g2) => {
          return g1.count >= g2.count ? -1 : 1;
        });

        getUsers().then(usersResponse => {
          this.givers = this.givers.map(r => {
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
          this.hideLoading();
        });
      });
    },
    showLoading(){
      return this.$store.dispatch('showLoading');
    },
    hideLoading(){
      return this.$store.dispatch('hideLoading');
    }
  },
});

const receiverTable = Vue.component('receiverTable', {
  template: `
    <div class="md-layout md-gutter">
      <div class="md-layout-item md-size-100 md-small-size-100">
        <md-table v-model="receivers" md-sort="count" md-sort-order="desc" md-card md-fixed-header>
          <md-table-row slot="md-table-row" slot-scope="{ item }">
            <md-table-cell md-label="Display Name" md-sort-by="realName" :title=item.username >
              <md-avatar>
                <img :src="item.image" alt="Avatar">
              </md-avatar>
              &nbsp; {{ item.realName }}
            </md-table-cell>
            <md-table-cell md-label="Count" md-sort-by="count" md-numeric>{{ item.count }}</md-table-cell>
            <md-table-cell md-label="Time Zone" md-sort-by="tz" md-numeric>{{ item.tz }}</md-table-cell>
          </md-table-row>
        </md-table>
      </div>
    </div>
  `,
  data: function() {
    return {
      receivers: []
    };
  },
  mounted(){
    const fromDate = this.$store.getters.getFromDate;
    const toDate = this.$store.getters.getToDate;
    this.getLeaderBoardData(fromDate, toDate);
  },
  created() {
    this.$store.subscribe((mutation, state)=>{
      if(mutation.type == 'SET_TO_DATE' ||  mutation.type == 'SET_FROM_DATE'){
        this.getLeaderBoardData(state.fromDate, state.toDate);
      }
    })
  },
  methods: {
    getLeaderBoardData(fromDate, toDate) {
      if (!fromDate || !toDate || fromDate.getTime() > toDate.getTime()) {
        this.receivers = [];
        return;
      }
      this.showLoading();
      apiGetLeaderBoard(fromDate, toDate).then(({ data }) => {
        this.hideLoading();
        const receiverCount = data.summary.receiverCount;
        const receivers = Object.keys(receiverCount).map(key => {
          let giver = {};
          giver.username = key;
          giver.count = receiverCount[key];
          return giver;
        });

        this.receivers = receivers.sort((r1, r2) => {
          return r1.count >= r2.count ? -1 : 1;
        });

        getUsers().then(usersResponse => {
          this.receivers = this.receivers.map(r => {
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

        });
      });
    },
    showLoading(){
      return this.$store.dispatch('showLoading');
    },
    hideLoading(){
      return this.$store.dispatch('hideLoading');
    }
  }
});

const store = new Vuex.Store({
  state: {
    isLoading: false,
    fromDate:getLastMonthFirstDate(),
    toDate:getThisMonthLastDate(),
  },
  getters:{
    getIsLoading: state => state.isLoading,
    getFromDate: state => state.fromDate,
    getToDate: state => state.toDate,
  },
  mutations: {
    SHOW_LOADING (state) {
      state.isLoading = true;
    },
    HIDE_LOADING(state){
      state.isLoading = false;
    },
    SET_FROM_DATE(state, fromDate){
      state.fromDate = fromDate;
    },
    SET_TO_DATE(state, toDate){
      state.toDate = toDate;
    }
  },
  actions: {
    showLoading ({commit}) {
      commit('SHOW_LOADING')
    },
    hideLoading ({commit}) {
      commit('HIDE_LOADING')
    },
    setFromDate({commit}, fromDate){
      commit('SET_FROM_DATE', fromDate)
    },
    setToDate({commit}, toDate){
      commit('SET_TO_DATE', toDate)
    }
  }
});

Vue.use(VueMaterial.default);
Vue.filter('formatDate', function(value) {
  if (value) {
    return new Intl.DateTimeFormat('en-US', {
      timeStyle: 'medium',
      dateStyle: 'medium',
    }).format(new Date(value));
  }
});

new Vue({
  store,
  router: new VueRouter({
    routes:[
      { path: '/', component: receiverTable },
      { path: '/giver', component: giverTable },
      { path: '/kudos', component: kudosTable }
    ]
  }),
  data:{
    menuVisible:false,
    fromDate: getLastMonthFirstDate(),
    toDate: getThisMonthLastDate(),
  },
  computed: {
    isLoading(){
      return this.$store.getters.getIsLoading;
    }
  },
  watch:{
    fromDate(newVal, oldVal){
      if(newVal && oldVal && newVal.getTime() == oldVal.getTime()){
        return;
      }
      this.$store.dispatch('setFromDate', newVal);
    },
    toDate(newVal, oldVal){
      if(newVal && oldVal && newVal.getTime() == oldVal.getTime()){
        return;
      }
      this.$store.dispatch('setToDate', newVal);
    }
  },
  template:`
  <div class="page-container">
    <md-app md-waterfall md-mode="fixed-last">
      <md-app-toolbar class="md-large md-dense md-primary">
        <div class="md-toolbar-row">
          <div class="md-toolbar-section-start">
            <md-button class="md-icon-button" @click="menuVisible = !menuVisible">
              <md-icon>menu</md-icon>
            </md-button>
            <span class="md-title">Kudos Me</span>
          </div>

          <div class="md-toolbar-section-end">
            <md-button class="md-icon-button">
              <md-icon>more_vert</md-icon>
            </md-button>
          </div>
        </div>
        <div class="md-toolbar-row">
          <md-tabs class="md-primary" md-sync-route>
            <md-tab id="tab-receiver" md-label="Receiver" to="/"></md-tab>
            <md-tab id="tab-giver" md-label="Giver" to="/giver"></md-tab>
            <md-tab id="tab-kudos" md-label="Kudos" to="/kudos"></md-tab>
          </md-tabs>
        </div>
      </md-app-toolbar>

      <md-app-drawer :md-active.sync="menuVisible">
        <md-list>
          <md-list-item>
            <md-icon>move_to_inbox</md-icon>
            <span class="md-list-item-text">Inbox</span>
          </md-list-item>
          <md-list-item>
            <md-icon>send</md-icon>
            <span class="md-list-item-text">Sent Mail</span>
          </md-list-item>
          <md-list-item>
            <md-icon>delete</md-icon>
            <span class="md-list-item-text">Trash</span>
          </md-list-item>
          <md-list-item>
            <md-icon>error</md-icon>
            <span class="md-list-item-text">Spam</span>
          </md-list-item>
        </md-list>
      </md-app-drawer>

      <md-app-content>
        <div class="md-layout md-gutter">
          <div class="md-layout-item md-size-30">
            <label>From Date:</label>
            <md-datepicker v-model="fromDate" :md-immediately="true" />
          </div>
          <div class="md-layout-item md-size-30">
            <label>To Date: </label>
            <md-datepicker v-model="toDate" :md-immediately="true" />
          </div>
          <div class="md-layout-item md-size-100" v-show="isLoading">
            <md-progress-bar class="md-accent" md-mode="query" ></md-progress-bar>
          </div>
        </div>
        <router-view></router-view>
      </md-app-content>
    </md-app>
  </div>
  `
}).$mount('#app');


function apiGetLeaderBoard(fromDate, toDate) {
  const fromDateISO = fromDate.toISOString().substr(0, 10);
  const toDateISO = toDate.toISOString().substr(0, 10);
  return fetch(
    END_POINT + '/kudos/leaderboard?fromDate=' + fromDateISO + '&toDate=' + toDateISO,
  )
    .then(res => res.json())
    .then(res => res);
}

function apiGetKudos(fromDate, toDate) {
  const fromDateISO = fromDate.toISOString().substr(0, 10);
  const toDateISO = toDate.toISOString().substr(0, 10);
  return fetch(
    END_POINT + '/commands/kudos?fromDate=' + fromDateISO + '&toDate=' + toDateISO,
  )
    .then(res => res.json())
    .then(res => res);
}

function getUsers() {
  const cacheKey = 'users-key';
  const cachedUsers = cacheGet(cacheKey);
  if (cachedUsers) {
    return Promise.resolve(cachedUsers);
  }

  return fetch(END_POINT + '/users/')
    .then(res => res.json())
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

function getLastMonthFirstDate() {
  let now = new Date();
  let year = now.getFullYear();
  let lastMonth = now.getMonth();
  if (now.getMonth() == 0) {
    lastMonth = 11;
    year = now.getFullYear() - 1;
  } else {
    lastMonth -= 1;
  }
  return new Date(year, lastMonth, 1);
}

function getThisMonthLastDate(){
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  );
}

function cachePut(key, object) {
  sessionStorage.setItem(key, JSON.stringify(object));
}

function cacheGet(key) {
  const cached = sessionStorage.getItem(key);
  return cached ? JSON.parse(cached) : cached;
}
