class User < ApplicationRecord

	# Include default devise modules. Others available are:
	# :confirmable, :lockable, :timeoutable and :omniauthable
	devise :database_authenticatable,
	:registerable, :recoverable, :rememberable, :trackable, :validatable

	validates :nickname, presence: true, length: { minimum: 3, maximum: 30 }
	
	has_many :collaborations
	has_many :favorites, dependent: :destroy # Si el usuario se elimina el favorito tambien

end

