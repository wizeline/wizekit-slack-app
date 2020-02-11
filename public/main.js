const END_POINT = '/api';

const appComponent = Vue.component('appComponent', {
  template: `
  <div class="md-layout md-gutter">
    <md-card class="md-layout-item md-size-100 md-small-size-100">
      <md-card-header>
        <div class="md-title">Dashboard</div>
      </md-card-header>
      <md-card-content>
        <div class="md-layout md-gutter">
          <div class="md-layout-item md-size-30">
            <label>From Date: </label>
            <md-datepicker v-model="fromDate" :md-immediately="true" />
          </div>
          <div class="md-layout-item md-size-30">
            <label>To Date: </label>
            <md-datepicker v-model="toDate" :md-immediately="true" />
          </div>
        </div>
        <md-progress-bar class="md-accent" md-mode="query" v-show="isLoading"></md-progress-bar>
        </md-card-content>
        <md-tabs class="md-primary">
          <md-tab id="tab-receivers" md-label="Receivers">
            <div class="md-layout md-gutter">
              <div class="md-layout-item md-small-size-50">
                <md-card>
                  <md-table v-model="receivers" md-sort="count" md-sort-order="desc" md-card md-fixed-header>
                    <md-table-row slot="md-table-row" slot-scope="{ item }">
                      <md-table-cell md-label="Display Name" md-sort-by="realName">
                        <md-avatar>
                          <img :src="item.image" alt="Avatar">
                        </md-avatar>
                        &nbsp; {{ item.realName }}
                      </md-table-cell>
                      <md-table-cell md-label="Count" md-sort-by="count" md-numeric>{{ item.count }}</md-table-cell>
                      <md-table-cell md-label="Time Zone" md-sort-by="tz" md-numeric>{{ item.tz }}</md-table-cell>
                    </md-table-row>
                  </md-table>
                </md-card>
              </div>
            </div>
          </md-tab>

          <md-tab id="tab-givers" md-label="Givers">
            <div class="md-layout md-gutter">
              <div class="md-layout-item md-small-size-50">
                <md-card>
                  <md-table v-model="givers" md-sort="count" md-sort-order="desc" md-card md-fixed-header>
                    <md-table-row slot="md-table-row" slot-scope="{ item }">
                      <md-table-cell md-label="Display Name" md-sort-by="realName">
                        <md-avatar>
                          <img :src="item.image" alt="Avatar">
                        </md-avatar>
                        &nbsp; {{ item.realName }}
                      </md-table-cell>
                      <md-table-cell md-label="Count" md-sort-by="count" md-numeric>{{ item.count }}</md-table-cell>
                      <md-table-cell md-label="Time Zone" md-sort-by="tz" md-numeric>{{ item.tz }}</md-table-cell>
                    </md-table-row>
                  </md-table>
                </md-card>
              </div>
            </div>
          </md-tab>

          <md-tab id="tab-kudos" md-label="Kudos">
            <div class="md-layout md-gutter">
              <div class="md-layout-item md-small-size-100">
                <md-card>
                  <md-table v-model="kudos" md-sort="createdAt" md-sort-order="desc" md-card md-fixed-header>
                    <md-table-row slot="md-table-row" slot-scope="{ item }">
                      <md-table-cell md-label="Display Name" md-sort-by="realName">
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
                </md-card>
              </div>
            </div>
          </md-tab>
        </md-tabs>
    </md-card>
  </div>
  `,
  data: function() {
    const lastMonthFirstDate = this.getLastMonthFirstDate();
    const now = new Date();
    const thisMonthLastDate = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    );
    return {
      fromDate: lastMonthFirstDate,
      toDate: thisMonthLastDate,
      kudos: [],
      receivers: [],
      givers: [],
      isLoading: true,
    };
  },
  mounted() {
    this.getLeaderBoardData(this.fromDate, this.toDate);
    this.getKudosList(this.fromDate, this.toDate);
  },
  methods: {
    getLastMonthFirstDate() {
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
    },
    getLeaderBoardData(fromDate, toDate) {
      const fromDateISO = fromDate.toISOString().substr(0, 10);
      const toDateISO = toDate.toISOString().substr(0, 10);
      apiGetLeaderBoard(fromDateISO, toDateISO).then(({ data }) => {
        this.isLoading = false;
        const giverCount = data.summary.giverCount;
        const givers = Object.keys(giverCount).map(key => {
          let giver = {};
          giver.username = key;
          giver.count = giverCount[key];
          return giver;
        });
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

        this.givers = givers.sort((g1, g2) => {
          return g1.count >= g2.count ? -1 : 1;
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
        });
      });
    },
    getKudosList(fromDate, toDate) {
      const fromDateISO = fromDate.toISOString().substr(0, 10);
      const toDateISO = toDate.toISOString().substr(0, 10);
      apiGetKudos(fromDateISO, toDateISO).then(({ data:kudosList }) => {
        getUsers().then(usersResponse => {
           this.kudos = kudosList.map((k, index)=> {
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
  },
  watch: {
    fromDate(newVal, oldVal) {
      if (newVal.getTime() === oldVal.getTime()
      || newVal.getTime() >= this.toDate.getTime()) {
        return;
      }
      this.isLoading = true;
      this.getLeaderBoardData(newVal, this.toDate);
      this.getKudosList(newVal, this.toDate);
    },
    toDate(newVal, oldVal) {
      if (newVal.getTime() === oldVal.getTime()
      || newVal.getTime() <= this.fromDate.getTime()) {
        return;
      }
      this.isLoading = true;
      this.getLeaderBoardData(this.fromDate, newVal);
      this.getKudosList(this.fromDate, newVal);
    },
  },
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
  el: '#app',
  components: {
    appComponent: appComponent,
  },
});

function apiGetLeaderBoard(fromDate = '2019-12-01', toDate) {
  return fetch(
    END_POINT + '/kudos/leaderboard?fromDate=' + fromDate + '&toDate=' + toDate,
  )
    .then(res => res.json())
    .then(res => res);
}

function apiGetKudos(fromDate = '2019-12-01', toDate) {
  return fetch(
    END_POINT + '/commands/kudos?fromDate=' + fromDate + '&toDate=' + toDate,
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

function cachePut(key, object) {
  sessionStorage.setItem(key, JSON.stringify(object));
}

function cacheGet(key) {
  const cached = sessionStorage.getItem(key);
  return cached ? JSON.parse(cached) : cached;
}
