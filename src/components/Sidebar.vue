<template>
  <div class="sidebar" :class="{ slidarShow: !collapseLocal && bodyWidth }">
    <div
      class="sidebar_close el-icon-close"
      v-if="!collapseLocal && bodyWidth"
      @click="collapseChage"
    ></div>
    <el-menu
      class="sidebar-el-menu"
      :default-active="routerMenu"
      :collapse="collapseLocal"
      background-color="#080B29"
      text-color="#B3C0E7"
      active-text-color="#fff"
      unique-opened
      router
    >
      <template>
        <template>
          <!-- 折叠按钮 -->
          <div class="header_logo pcShow" :class="{ header_left_hidd: collapseLocal }">
            <div class="logo" v-if="!collapseLocal">
              <img src="@/assets/images/LOGO_MCS@2x.png" />
            </div>
          </div>
          <div class="menu_list">
            <el-menu-item
              v-for="(item, i) in items"
              :key="i"
              :index="item.index"
              @click="sidebarLiIndex(item.name, item.index, item.type)"
            >
              <i :class="item.icon" style="font-size: 15px"></i>
              <span slot="title">{{ item.title }}</span>
            </el-menu-item>
            <el-menu-item class="mobileShow" v-if="metaAddress">
              <i class="el-icon-switch-button" style="font-size: 15px"></i>
              <span slot="title" @click="signOutFun">{{ $t("fs3.Disconnect") }}</span>
            </el-menu-item>
          </div>
          <div class="fes-icon-logo">
            <span class="powerby">Powered by FilSwan <img src="@/assets/images/FILSWAN_logo.png" height="18" alt=""></span>
          </div>
        </template>
      </template>
    </el-menu>

    <!-- <div class="copyStyle" v-if="!collapseLocal">{{ $t('navbar.copy') }} {{git_version}}</div> -->
  </div>
</template>

<script>
// import bus from './bus';
import axios from "axios";
export default {
  data() {
    return {
      git_version: null,
      collapseLocal:
        this.$store.getters.collapseL == "true" || this.$store.getters.collapseL == true
          ? true
          : false,
      lanShow: false,
      bodyWidth: document.body.clientWidth < 999 ? true : false,
      items: [
        // {
        //     icon: 'el-icon-s-upload',
        //     index: '0',
        //     title: this.$t('route.Upload_files'),
        //     name: 'upload_file',
        //     type: ''
        // },
        {
          icon: "el-icon-s-deal",
          index: "1",
          title: this.$t("route.Deal"),
          name: "my_files",
          type: "",
        },
        // {
        //     icon: 'el-icon-search',
        //     index: '2',
        //     title: this.$t('route.Search_file'),
        //     name: 'Search_file',
        //     type: ''
        // },
        {
          icon: "el-icon-s-billing",
          index: "5",
          title: this.$t("navbar.BillingHistory"),
          name: "billing",
          type: "",
        },
        // {
        //     icon: 'el-icon-s-myAccount',
        //     index: '3',
        //     title: this.$t('route.myAccount'),
        //     name: 'settings',
        //     type: ''
        // },
        {
          icon: "el-icon-s-Stats",
          index: "4",
          title: this.$t("route.Stats"),
          name: "Stats",
          type: "",
        },
        // {
        //     icon: 'el-icon-s-documentation',
        //     index: '',
        //     title: this.$t('route.documentation'),
        //     name: '',
        //     type: ''
        // },
      ],
      share_img1: require("@/assets/images/landing/medium.png"),
      share_img2: require("@/assets/images/landing/twitter.png"),
      share_img3: require("@/assets/images/landing/github-fill.png"),
      share_img5: require("@/assets/images/landing/facebook-fill.png"),
      share_img7: require("@/assets/images/landing/slack.png"),
      share_img8: require("@/assets/images/landing/youtube.png"),
      share_img9: require("@/assets/images/landing/telegram.png"),
      share_img10: require("@/assets/images/landing/discord.png"),
    };
  },
  computed: {
    routerMenu() {
      return this.$store.getters.routerMenu.toString();
    },
    languageMcs() {
      return this.$store.getters.languageMcs;
    },
    email() {
      return this.$store.state.user.email;
    },
    collapseL() {
      return this.$store.getters.collapseL;
    },
    metaAddress() {
      return this.$store.getters.metaAddress;
    },
  },
  watch: {
    collapseL: function () {
      this.collapseLocal =
        this.$store.getters.collapseL == "true" || this.$store.getters.collapseL == true
          ? true
          : false;
    },
  },
  created() {
    if (process.env.COMMITHASH) {
      this.git_version = process.env.COMMITHASH.slice(0, 8);
    }
    // 通过 Event Bus 进行组件间通信，来折叠侧边栏
    // bus.$on('collapse', msg => {
    //     this.collapseChild = msg;
    //     bus.$emit('collapse-content', msg);
    //     this.$emit('collapseVisit', this.collapseChild);
    //     this.$store.dispatch('setCollapse', this.collapseChild)
    // });
  },
  methods: {
    sidebarLiIndex(nameNow, index, typeNow) {
      let _this = this;
      let head_title = "";
      let indexNow = Number(index);
      switch (indexNow) {
        case 2:
          localStorage.removeItem("tabTask_name");
          localStorage.removeItem("tabTask_search");
          localStorage.removeItem("tabTaskMiner_search");
          break;
        case 4:
          localStorage.removeItem("myProfileActive");
          break;
        default:
      }
      if (!nameNow && !indexNow) {
        window.open("https://docs.filswan.com/multi-chain-storage/overview", "_blank");
        window.location.reload();
        return false;
      }
      _this.$store.dispatch("setRouterMenu", Number(index));
      if (typeNow) {
        _this.$router.push({ name: nameNow, params: { type: typeNow } });
        return false;
      } else {
        _this.$router.push({ name: nameNow });
      }
    },
    collapseChage() {
      this.collapseLocal = !this.collapseLocal;
      this.$store.dispatch("setCollapse", this.collapseLocal);
      // bus.$emit('collapse', this.collapseLocal);
      // this.$emit('collapseVisit', this.collapseLocal);
    },
    logout() {
      var _this = this;

      let params = {};
      axios
        .post(_this.data_api + "auth/logout", params, {
          headers: {
            Authorization: "Bearer " + _this.$store.getters.accessToken,
          },
        })
        .then((response) => {
          if (response.data.status == "success") {
            _this.$store.dispatch("FedLogOut").then(() => {
              _this.$router.push("/supplierAllBack");
              _this.loginShow = localStorage.getItem("mcsLoginAccessToken")
                ? false
                : true;
            });
          } else {
            console.log(response.data.message);
            _this.$message.error(response.data.message);
          }
        })
        .catch(function (error) {
          if (error.response) {
            console.log(error.response.headers);
          } else if (error.request) {
            console.log(error.request);
          } else {
            console.log(error.message);
          }
          console.log(error.config);

          _this.$store.dispatch("FedLogOut").then(() => {
            _this.$router.push("/login");
            _this.loginShow = localStorage.getItem("mcsLoginAccessToken") ? false : true;
          });
        });
    },
    handleSetLanguage(lang) {
      let _this = this;
      _this.$i18n.locale = lang;
      _this.$store.dispatch("setLanguage", lang);
      window.location.reload();
    },
    signOutFun() {
      this.$store.dispatch("setMetaAddress", "");
      this.$store.dispatch("setMetaNetworkId", 0);
      this.$store.dispatch("setMetaNetworkInfo", JSON.stringify({}));
      this.$router.push("/supplierAllBack");
    },
  },
};
</script>

<style scoped lang="scss">
.sidebar {
  display: block;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 9999;
  transition: all 0.3s;
  background: #080b29;
  .mobileShow {
    display: none;
  }
  .powerby {
    font-size: 14px;
    color: white;
    display: flex;
  }
  .sidebar_close {
    position: absolute;
    right: 0;
    top: 0;
    font-size: 18px;
    font-weight: 600;
    color: #ffffff;
    cursor: pointer;
    z-index: 999999;
    display: block;
    padding: 0.05rem;
  }
}
.sidebar-el-menu {
  // width: 0.65rem;
  // height: calc(100% - 0.31rem);
  height: 100%;
  padding: 0;
  border-right: 0;
  // transition: width .3s;
  .menu_list {
    // height: calc(100% - 1.2rem);
    margin: 0 0.2rem;
    padding: 0;
    overflow-x: hidden;
    overflow-y: scroll;
    // 火狐浏览器滚动条样式设置
    scrollbar-color: #ccc transparent; //滚动条轨道颜色   滚动条滑块的颜色
    scrollbar-width: none;
    scrollbar-width: thin; //thin模式下滚动条两端的三角按钮会消失
    scrollbar-width: 0; //默认大小
    // 谷歌滚动条
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    &::-webkit-scrollbar {
      width: 2px;
      background: transparent;
    }
    &::-webkit-scrollbar-thumb {
      background: #ccc;
    }
  }
  .header_logo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: calc(100% - 0.3rem);
    padding: 0.41rem 0 0.62rem;
    background-color: #080b29;
    // transition: width .3s;
    .logo {
      width: 2.1rem;
      img {
        display: block;
        width: 100%;
        height: auto;
      }
    }
    .header_btn {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      width: 0.26rem;
      height: 0.26rem;
      margin: 0 0 0 0.06rem;
      transition: all 0.4s ease;
      outline: none;
    }
    .header_btn span {
      position: relative;
      display: block;
      width: 100%;
      height: 1px;
      margin: auto;
      background-color: #fff;
      transition: all 0.4s ease;
    }
    .header_btn span::after {
      content: "";
      position: absolute;
      top: -7px;
      right: 0;
      width: 50%;
      height: 1px;
      background-color: #fff;
      transition: all 0.4s ease;
    }
    .header_btn span::before {
      content: "";
      position: absolute;
      bottom: -7px;
      right: 0;
      width: 75%;
      height: 1px;
      background-color: #fff;
      transition: all 0.4s ease;
    }
    .header_btn.header_btn_left span::before,
    .header_btn.header_btn_left span::after {
      right: auto;
      left: 0;
    }
    .header_btn:hover span,
    .header_btn:hover span::before,
    .header_btn:hover span::after {
      width: 100%;
      background-color: #fff;
    }
  }
  .header_left_hidd {
    width: 100%;
    height: 0.9rem;
    padding: 0.2rem 0 0.1rem;
    flex-wrap: wrap;
    justify-content: center;
    .logo_small {
      display: block;
      width: 100%;
      height: 0.34rem;
      margin: auto;
      img {
        display: block;
        height: 100%;
        max-width: 100%;
        margin: auto;
      }
    }
    .collapse-btn-cont {
      transform: rotate(180deg);
      .header_btn {
        margin: auto;
      }
    }
  }
  .fes-icon-logo {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 0.1rem 0 0.3rem;
    img {
      display: block;
      height: 24px;
      margin: 0 0.18rem;
      @media screen and (max-width: 999px) {
        height: 20px;
      }
    }
  }
  .collapse-btn-cont {
    float: left;
    padding: 0;
    cursor: pointer;
    align-items: center;
    display: flex;
  }
  li {
    display: flex;
    height: 0.5rem;
    padding: 0 0.28rem;
    margin: 0.12rem 0;
    font-size: 0.24rem;
    font-weight: 500;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    line-height: 0.5rem;
    div {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    i {
      position: relative;
      height: 0.2rem;
      // margin-right: 0.22rem;
      &::before {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        content: "";
        background-size: 0.2rem !important;
      }
    }
    .el-icon-switch-button {
      &::before {
        content: "\E71B";
      }
    }
    .el-icon-s-home {
      &::before {
        background: url(../assets/images/menuIcon/Dashboard.png) no-repeat center;
      }
    }
    .el-icon-s-upload {
      &::before {
        background: url(../assets/images/menuIcon/uploadFile.png) no-repeat center;
      }
    }
    .el-icon-s-browse {
      &::before {
        background: url(../assets/images/menuIcon/browse.png) no-repeat center;
      }
    }
    .el-icon-s-deal {
      &::before {
        background: url(../assets/images/menuIcon/icon_Files@2x.png) no-repeat center;
      }
    }
    .el-icon-s-myFs3 {
      &::before {
        background: url(../assets/images/menuIcon/S3.png) no-repeat center;
      }
    }
    .el-icon-s-myProfile {
      &::before {
        background: url(../assets/images/menuIcon/myProfile.png) no-repeat center;
      }
    }
    .el-icon-s-tools {
      &::before {
        background: url(../assets/images/menuIcon/tool.png) no-repeat center;
      }
    }
    .el-icon-s-Stats {
      &::before {
        background: url(../assets/images/menuIcon/icon_Statistics@2x.png) no-repeat center;
      }
    }
    .el-icon-s-documentation {
      &::before {
        background: url(../assets/images/menuIcon/icon_documentation@2x.png) no-repeat
          center;
      }
    }
    .el-icon-language {
      &::before {
        background: url(../assets/images/menuIcon/language.png) no-repeat center;
        background-size: 100% !important;
      }
    }
    .el-icon-s-dataset {
      &::before {
        background: url(../assets/images/menuIcon/myAccount.png) no-repeat center;
      }
    }
    .el-icon-search {
      &::before {
        background: url(../assets/images/menuIcon/Search-File.png) no-repeat center;
      }
    }
    .el-icon-s-myAccount {
      &::before {
        background: url(../assets/images/menuIcon/myAccount.png) no-repeat center;
      }
    }
    .el-icon-s-billing {
      &::before {
        background: url(../assets/images/menuIcon/billing@2x.png) no-repeat center;
      }
    }
  }

  .el-menu-item:hover,
  .is-active {
    background: linear-gradient(45deg, #4f8aff, #4b5eff);
    border-radius: 0.06rem;
    color: #fff !important;
    .el-icon-s-home {
      &::before {
        background: url(../assets/images/menuIcon/Dashboard-1.png) no-repeat center;
      }
    }
    .el-icon-s-upload {
      &::before {
        background: url(../assets/images/menuIcon/uploadFile-1.png) no-repeat center;
      }
    }
    .el-icon-s-browse {
      &::before {
        background: url(../assets/images/menuIcon/browse-1.png) no-repeat center;
      }
    }
    .el-icon-s-deal {
      &::before {
        background: url(../assets/images/menuIcon/icon_Files@2x-1.png) no-repeat center;
      }
    }
    .el-icon-s-myFs3 {
      &::before {
        background: url(../assets/images/menuIcon/S3-1.png) no-repeat center;
      }
    }
    .el-icon-s-myProfile {
      &::before {
        background: url(../assets/images/menuIcon/myProfile-1.png) no-repeat center;
      }
    }
    .el-icon-s-tools {
      &::before {
        background: url(../assets/images/menuIcon/tool-1.png) no-repeat center;
      }
    }
    .el-icon-s-Stats {
      &::before {
        background: url(../assets/images/menuIcon/icon_Statistics@2x-1.png) no-repeat
          center;
      }
    }
    .el-icon-s-documentation {
      &::before {
        background: url(../assets/images/menuIcon/icon_documentation@2x-1.png) no-repeat
          center;
      }
    }
    .el-icon-language {
      &::before {
        background: url(../assets/images/menuIcon/language-1.png) no-repeat center;
        background-size: 100% !important;
      }
    }
    .el-icon-s-dataset {
      &::before {
        background: url(../assets/images/menuIcon/dataset-1.png) no-repeat center;
      }
    }
    .el-icon-search {
      &::before {
        background: url(../assets/images/menuIcon/Search-File-1.png) no-repeat center;
      }
    }
    .el-icon-s-myAccount {
      &::before {
        background: url(../assets/images/menuIcon/myAccount-1.png) no-repeat center;
      }
    }
    .el-icon-s-billing {
      &::before {
        background: url(../assets/images/menuIcon/billing@2x-1.png) no-repeat center;
      }
    }
  }
  .el-menu-item span {
    position: relative;
    /* transition: all 0.4s ease; */
  }
  .el-menu-item span::after {
    content: "";
    position: absolute;
    left: 50%;
    width: 0;
    bottom: 7px;
    margin: auto;
    height: 2px;
    //background-color: #080B29;
    transition: all 0.4s ease;
  }
  .el-menu-item span:hover::after {
    left: 0;
    width: 100%;
  }
  &:not(.el-menu--collapse) {
    width: 3.33rem;
    li {
      width: auto;
    }
  }
}
.copyStyle {
  padding: 0 0 0 0.1rem;
  background: #080b29;
  font-size: 0.12rem;
  line-height: 0.3rem;
  color: #9c9c9c;
  border-top: 0.01rem solid rgba(255, 255, 255, 0.2);
  z-index: 999;
}

@media screen and (max-width: 999px) {
  .sidebar {
    top: 0;
    left: -4rem;
    -webkit-transition: all 0.3s ease;
    -moz-transition: all 0.3s ease;
    -ms-transition: all 0.3s ease;
    -o-transition: all 0.3s ease;
    transition: all 0.3s ease;
    .mobileShow {
      display: block;
    }
    .sidebar-el-menu {
      width: 4rem;
      .menu_list {
        // height: calc(100% - 0.5rem);
        padding: 50px 0 0;
      }

      &:not(.el-menu--collapse) {
        width: 4rem;
      }
    }
    .pcShow {
      display: none;
    }
  }
  .slidarShow {
    left: 0;
  }
}
</style>
