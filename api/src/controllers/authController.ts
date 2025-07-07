import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '@/repositories/UserRepository';
import { logger } from '@/utils/logger';

export class AuthController {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        res.status(400).json({
          error: 'User with this email already exists'
        });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await this.userRepository.create({
        email,
        password_hash: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        role: 'user'
      });

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );

      // Remove password from response
      const { password_hash, ...userWithoutPassword } = user;

      res.status(201).json({
        message: 'User registered successfully',
        user: userWithoutPassword,
        token
      });

      logger.info(`User registered: ${email}`);
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        error: 'Internal server error during registration'
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        res.status(401).json({
          error: 'Invalid email or password'
        });
        return;
      }

      // Check if user is active
      if (!user.is_active) {
        res.status(401).json({
          error: 'Account is deactivated'
        });
        return;
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        res.status(401).json({
          error: 'Invalid email or password'
        });
        return;
      }

      // Update last login
      await this.userRepository.updateLastLogin(user.id);

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );

      // Remove password from response
      const { password_hash, ...userWithoutPassword } = user;

      res.json({
        message: 'Login successful',
        user: userWithoutPassword,
        token
      });

      logger.info(`User logged in: ${email}`);
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        error: 'Internal server error during login'
      });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        res.status(401).json({
          error: 'User not authenticated'
        });
        return;
      }

      const user = await this.userRepository.findById(userId);
      if (!user) {
        res.status(404).json({
          error: 'User not found'
        });
        return;
      }

      // Remove password from response
      const { password_hash, ...userWithoutPassword } = user;

      res.json({
        user: userWithoutPassword
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { firstName, lastName } = req.body;

      if (!userId) {
        res.status(401).json({
          error: 'User not authenticated'
        });
        return;
      }

      const updatedUser = await this.userRepository.update(userId, {
        first_name: firstName,
        last_name: lastName
      });

      if (!updatedUser) {
        res.status(404).json({
          error: 'User not found'
        });
        return;
      }

      // Remove password from response
      const { password_hash, ...userWithoutPassword } = updatedUser;

      res.json({
        message: 'Profile updated successfully',
        user: userWithoutPassword
      });

      logger.info(`User profile updated: ${updatedUser.email}`);
    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        res.status(401).json({
          error: 'User not authenticated'
        });
        return;
      }

      const user = await this.userRepository.findById(userId);
      if (!user) {
        res.status(404).json({
          error: 'User not found'
        });
        return;
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isCurrentPasswordValid) {
        res.status(400).json({
          error: 'Current password is incorrect'
        });
        return;
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await this.userRepository.update(userId, {
        password_hash: hashedNewPassword
      });

      res.json({
        message: 'Password changed successfully'
      });

      logger.info(`Password changed for user: ${user.email}`);
    } catch (error) {
      logger.error('Change password error:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
}