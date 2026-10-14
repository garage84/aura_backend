CREATE SCHEMA IF NOT EXISTS private;
CREATE SCHEMA IF NOT EXISTS community;

-- Private identity zone (isolated from public app code)
CREATE TABLE IF NOT EXISTS private.users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(32) UNIQUE,
    password_hash VARCHAR(255),
    profile_id VARCHAR(64) NOT NULL UNIQUE,
    status VARCHAR(32) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS private.identity_verifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES private.users(id),
    provider VARCHAR(64) NOT NULL,
    provider_ref VARCHAR(255) NOT NULL,
    person_key_hash VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(32) NOT NULL DEFAULT 'verified',
    level VARCHAR(32) DEFAULT 'human_liveness',
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS private.audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    actor VARCHAR(128) NOT NULL,
    action VARCHAR(128) NOT NULL,
    subject VARCHAR(128) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Public community zone (pseudonymous data only)
CREATE TABLE IF NOT EXISTS community.public_profiles (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(48) NOT NULL UNIQUE,
    avatar_ref VARCHAR(255),
    bio TEXT,
    settings JSONB DEFAULT '{}',
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS community.communities (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(128) NOT NULL,
    purpose TEXT NOT NULL,
    rules JSONB NOT NULL DEFAULT '[]',
    moderation_info TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS community.community_members (
    id VARCHAR(64) PRIMARY KEY,
    community_id VARCHAR(64) NOT NULL REFERENCES community.communities(id),
    profile_id VARCHAR(64) NOT NULL REFERENCES community.public_profiles(id),
    role VARCHAR(32) NOT NULL DEFAULT 'Member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (community_id, profile_id)
);

CREATE TABLE IF NOT EXISTS community.posts (
    id VARCHAR(64) PRIMARY KEY,
    author_profile_id VARCHAR(64) REFERENCES community.public_profiles(id),
    community_id VARCHAR(64) NOT NULL REFERENCES community.communities(id),
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    topic VARCHAR(128),
    visibility VARCHAR(32) NOT NULL DEFAULT 'community',
    moderation_state VARCHAR(32) NOT NULL DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS community.comments (
    id VARCHAR(64) PRIMARY KEY,
    post_id VARCHAR(64) NOT NULL REFERENCES community.posts(id),
    parent_id VARCHAR(64) REFERENCES community.comments(id),
    author_profile_id VARCHAR(64) NOT NULL REFERENCES community.public_profiles(id),
    body TEXT NOT NULL,
    moderation_state VARCHAR(32) NOT NULL DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS community.reactions (
    id VARCHAR(64) PRIMARY KEY,
    target_type VARCHAR(32) NOT NULL,
    target_id VARCHAR(64) NOT NULL,
    profile_id VARCHAR(64) NOT NULL REFERENCES community.public_profiles(id),
    kind VARCHAR(32) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (target_type, target_id, profile_id, kind)
);

CREATE TABLE IF NOT EXISTS community.reports (
    id VARCHAR(64) PRIMARY KEY,
    target_type VARCHAR(32) NOT NULL,
    target_id VARCHAR(64) NOT NULL,
    reporter_profile_id VARCHAR(64) NOT NULL REFERENCES community.public_profiles(id),
    reason TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS community.moderation_actions (
    id VARCHAR(64) PRIMARY KEY,
    report_id VARCHAR(64) REFERENCES community.reports(id),
    moderator_profile_id VARCHAR(64) REFERENCES community.public_profiles(id),
    action VARCHAR(64) NOT NULL,
    rationale TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
