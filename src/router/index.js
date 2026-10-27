import { createRouter, createWebHistory } from 'vue-router'

import StartView from '../views/StartView.vue'
import LoginView from '../views/LoginView.vue'
import RegistrationView from '../views/RegistrationView.vue'
import SubmitDeviceView from '../views/SubmitDeviceView.vue'
import DeviceView from '../views/DeviceView.vue'

import ImpressumView from '@/views/ImpressumView.vue'
import PrivacyPolicyView from '@/views/PrivacyPolicyView.vue'
import AccountSettingsView from '@/views/AccountSettingsView.vue'
import ToolsView from '@/views/ToolsView.vue'
import AdminUserManagementView from '@/views/AdminUserManagementView.vue'
import ModeratorPostsView from '@/views/ModeratorPostsView.vue'
import ModeratorReportsView from '@/views/ModeratorReportsView.vue'
import ModeratorUpdatesView from '@/views/ModeratorUpdatesView.vue'
import EditDeviceView from '@/views/EditDeviceView.vue'

import UserSubmissionsView from '@/views/UserSubmissionsView.vue'
import CompareView from '../views/CompareView.vue'
import PrivacyPropertyView from '@/views/PrivacyPropertyView.vue'
//import UserPostView from '@/views/UserPostView.vue'
//import ModeratorPostView from '@/views/ModeratorPostView.vue'

import ArticlesLayout from '@/views/ArticlesLayout.vue'
import ArticleViewNetwork from '@/views/ArticleViewNetwork.vue'
import ArticleViewPhotographicDocumentation from '@/views/ArticleViewPhotographicDocumentation.vue'
import ArticleViewFirmwareDocumentation from '@/views/ArticleViewFirmwareDocumentation.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: StartView,
    },

    {
      path: '/login/:message?',
      name: 'login',
      component: LoginView,
      props: true,
    },

    {
      path: '/register',
      name: 'register',
      component: RegistrationView,
    },

    {
      path: '/tools',
      name: 'tools',
      component: ToolsView,
    },

    {
      path: '/privacyproperty',
      name: 'privacyproperty',
      component: PrivacyPropertyView,
    },

    {
      path: '/account',
      name: 'accountsettings',
      component: AccountSettingsView,
      meta: { requiresAuth: true },
    },

    {
      path: '/submissions',
      name: 'submissions',
      component: UserSubmissionsView,
      meta: { requiresAuth: true },
    },

    {
      path: '/submit',
      name: 'submitNewDevice',
      component: SubmitDeviceView,
      meta: { requiresPermission: 'create_post' },
    },

    {
      path: '/device/:id',
      name: 'DeviceView',
      component: DeviceView,
      props: true,
    },

    {
      path: '/device/:id/edit',
      name: 'EditDeviceView',
      component: EditDeviceView,
      props: true,
      meta: { requiresAuth: true },
    },

    {
      path: '/compare/:id1/:id2?',
      name: 'CompareView',
      component: CompareView,
      props: true,
    },

    {
      path: '/impressum',
      name: 'impressum',
      component: ImpressumView,
    },
    {
      path: '/datenschutz',
      name: 'datenschutz',
      component: PrivacyPolicyView,
    },

    // Admin
    {
      path: '/manage/users',
      name: 'AdminUserManagement',
      component: AdminUserManagementView,
      meta: { requiresPermission: 'manage_users' },
    },

    // Moderator
    {
      path: '/manage/submissions',
      name: 'ModeratorPosts',
      component: ModeratorPostsView,
      meta: { requiresPermission: 'manage_posts' },
    },
    {
      path: '/manage/reports',
      name: 'ModeratorReports',
      component: ModeratorReportsView,
      meta: { requiresPermission: 'manage_posts' },
    },
    {
      path: '/manage/updates',
      name: 'ModeratorUpdates',
      component: ModeratorUpdatesView,
      meta: { requiresPermission: 'manage_posts' }
    },

    // Articles

    {
      path: '/articles',
      name: 'Articles',
      component: ArticlesLayout,

      children: [
        {
          path: 'network',
          name: 'article-network',
          component: ArticleViewNetwork,
        },
        {
          path: 'photo',
          name: 'article-photo',
          component: ArticleViewPhotographicDocumentation,
        },
        {
          path: 'firmware',
          name: 'article-firmware',
          component: ArticleViewFirmwareDocumentation,
        },
      ],
    },
  ],
})

// Enforce login for protected routes
import { useAuth } from '@/stores/auth'
router.beforeEach((to, from, next) => {
  const auth = useAuth()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (to.meta.requiresPermission && !auth.hasPermission(to.meta.requiresPermission)) {
    next({ name: 'home' })
  } else {
    next()
  }
})

/*
import { useAuth } from '@/stores/auth'

const auth = useAuth()
auth.loadFromStorage()

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (auth.isLoggedIn) {
      next()
    } else {
      next('/login')
    }
  } else {
    next()
  }
})
*/

export default router
