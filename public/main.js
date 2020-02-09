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
            <label>FromDate</label>
            <md-datepicker v-model="fromDate" :md-immediately="true" />
          </div>
        </div>
        <md-tabs>
          <md-tab id="tab-receivers" md-label="Receivers">
            <div class="md-layout md-gutter">
              <div class="md-layout-item md-small-size-50">
                <md-card>
                  <md-table v-model="receivers" md-sort="count" md-sort-order="desc" md-card md-fixed-header>
                    <md-table-row slot="md-table-row" slot-scope="{ item }">
                      <md-table-cell md-label="Username" md-sort-by="username">{{ item.username }}</md-table-cell>
                      <md-table-cell md-label="Count" md-sort-by="count" md-numeric>{{ item.count }}</md-table-cell>
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
                      <md-table-cell md-label="Username" md-sort-by="username">{{ item.username }}</md-table-cell>
                      <md-table-cell md-label="Count" md-sort-by="count" md-numeric>{{ item.count }}</md-table-cell>
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
                      <md-table-cell md-label="Username" md-sort-by="user_name">{{ item.user_name }}</md-table-cell>
                      <md-table-cell md-label="Text" md-sort-by="text">{{ item.text }}</md-table-cell>
                      <md-table-cell md-label="CreatedAt" md-sort-by="createdAt">{{ item.createdAt }}</md-table-cell>
                      <md-table-cell md-label="Channel Name" md-sort-by="channel_name">{{ item.channel_name }}</md-table-cell>
                    </md-table-row>
                  </md-table>
                </md-card>
              </div>
            </div>
          </md-tab>
        </md-tabs>
        <md-progress-bar class="md-accent" md-mode="query" v-if="isLoading"></md-progress-bar>
        </md-card-content>
    </md-card>
  </div>
  `,
  data: function() {
    const lastMonthFirstDate = this.getLastMonthFirstDate();
    return {
      fromDate: lastMonthFirstDate,
      kudos: [],
      receivers:[],
      givers:[],
      isLoading: true
    }
  },
  mounted(){
    this.getLeaderBoardData(this.fromDate);
    this.getKudosList(this.fromDate);
  },
  methods:{
    getLastMonthFirstDate(){
      let now = new Date();
      let year = now.getFullYear();
      let lastMonth = now.getMonth();
      if(now.getMonth() == 0 ){
        lastMonth = 11;
        year = now.getFullYear() - 1 ;
      }else {
        lastMonth -=1;
      }
      return new Date(year, lastMonth , 1);
    },
    getLeaderBoardData(fromDate){
      const fromDateISO = fromDate.toISOString().substr(0,10);
      apiGetLeaderBoard(fromDateISO)
      .then(({data})=>{
        this.isLoading = false;
        const giverCount = data.summary.giverCount;
        const givers = Object.keys(giverCount).map(
          key => {
            let giver = {};
            giver.username = key;
            giver.count = giverCount[key];
            return giver;
          }
        );
        const receiverCount = data.summary.receiverCount;
        const receivers = Object.keys(receiverCount).map(
          key => {
            let giver = {};
            giver.username = key;
            giver.count = receiverCount[key];
            return giver;
          }
        );

        this.receivers = receivers.sort((r1, r2)=>{
          return r1.count >= r2.count ? -1 : 1;
        });

        this.givers = givers.sort((g1, g2)=>{
          return g1.count >= g2.count ? -1 : 1;
        });

      });
    },
    getKudosList(fromDate){
      const fromDateISO = fromDate.toISOString().substr(0,10);
      apiGetKudos(fromDateISO).then(({data})=>{
        this.kudos = data;
      })
    }
  },
  watch:{
    fromDate(fromDate){
      this.isLoading = true;
      this.getLeaderBoardData(fromDate);
      this.getKudosList(fromDate);
    }
  }
});

Vue.use(VueMaterial.default)

new Vue({
  el: '#app',
  components: {
    appComponent: appComponent
   }
});

function apiGetLeaderBoard(fromDate = '2019-12-01'){
  return fetch(END_POINT + '/kudos/leaderboard?fromDate='+fromDate)
  .then(res => res.json())
  .then(res => res);
}


function apiGetKudos(fromDate = '2019-12-01'){
  return fetch(END_POINT + '/commands/kudos?fromDate='+fromDate)
  .then(res => res.json())
  .then(res => res);
}
