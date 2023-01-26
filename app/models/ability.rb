class Ability
  include CanCan::Ability

  def initialize(user)
    return unless user.present?

    if user.admin?
      can :manage, :all
    else
      can :manage, Article, user_id: user.id
      can :manage, Category, user_id: user.id
      can :read, Article
    end
  end
end
