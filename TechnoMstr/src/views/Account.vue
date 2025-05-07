<template>
    <main class="account-page">
        <h1>Account</h1>
        <p>This is the account page</p>
    </main>
</template>

<style lang="scss" scoped>
  .account-page {
    width: 102%;
    padding: 1rem;
    padding-left: calc(2rem + 48px);
    box-sizing: border-box;
    transition: padding-left 0.2s ease-out;

    &.sidebar-expanded {
      padding-left: calc(var(--sidebar-width) + 1rem);
    }
    
    h1 {
      margin-bottom: 1rem;
    }
  }
  </style>